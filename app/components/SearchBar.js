"use client";

import { useState, useEffect, useRef } from "react";
import { formatDisplayName } from "@/lib/utils/formatting";
import { showErrorToast } from "./ErrorToast";

/**
 * Calculate relevance score for search result ranking
 * Higher score = better match
 */
function calculateRelevanceScore(result, searchQuery) {
	let score = 0;
	const query = searchQuery.toLowerCase();
	const displayName = result.display_name.toLowerCase();
	const nameParts = displayName.split(',').map(p => p.trim());
	const cityName = nameParts[0] || '';
	
	// Exact city name match (highest priority)
	if (cityName === query) {
		score += 1000;
	} else if (cityName.startsWith(query)) {
		// City starts with query (high priority)
		score += 500;
	} else if (cityName.includes(query)) {
		// City contains query
		score += 200;
	}
	
	// Boost capital cities
	if (result.address?.city && result.type === 'administrative') {
		score += 150;
	}
	
	// Boost by importance
	if (result.importance) {
		score += result.importance * 100;
	}
	
	// Boost larger places (prefer cities over small towns)
	const placeType = result.type || result.class;
	if (placeType === 'city') score += 100;
	else if (placeType === 'town') score += 50;
	else if (placeType === 'village') score += 10;
	
	// Penalize very long names (likely less relevant)
	if (displayName.length > 100) {
		score -= 50;
	}
	
	// Boost if country name matches query
	const countryName = nameParts[nameParts.length - 1] || '';
	if (countryName.toLowerCase().includes(query)) {
		score += 100;
	}
	
	return score;
}

/**
 * Remove near-duplicate results (same city, different admin levels)
 */
function removeDuplicates(results, query) {
	const seen = new Map();
	const filtered = [];
	
	for (const result of results) {
		const nameParts = result.display_name.split(',').map(p => p.trim());
		const cityName = nameParts[0];
		const countryName = nameParts[nameParts.length - 1];
		const key = `${cityName}-${countryName}`;
		
		if (!seen.has(key)) {
			seen.set(key, result);
			filtered.push(result);
		} else {
			// Keep the one with higher importance
			const existing = seen.get(key);
			if (result.importance > existing.importance) {
				// Replace with more important result
				const index = filtered.indexOf(existing);
				filtered[index] = result;
				seen.set(key, result);
			}
		}
	}
	
	return filtered;
}

export default function SearchBar({ onSearch }) {
	const [query, setQuery] = useState("");
	const [suggestions, setSuggestions] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [isFocused, setIsFocused] = useState(false);
	const containerRef = useRef(null);
	const abortRef = useRef(null);
	const cacheRef = useRef({});

	// Fetch suggestions from Photon API
	const fetchSuggestions = async (searchText) => {
		if (searchText.length < 2) return;
		
		// Check cache
		const cacheKey = searchText.toLowerCase();
		if (cacheRef.current[cacheKey]) {
			setSuggestions(cacheRef.current[cacheKey]);
			setIsLoading(false);
			return;
		}

		setIsLoading(true);
		// Abort previous request
		if (abortRef.current) {
			abortRef.current.abort();
		}
		const controller = new AbortController();
		abortRef.current = controller;

		try {
			// Photon API - Add lang=en to get romanized names for international cities
			const res = await fetch(
				`https://photon.komoot.io/api/?` +
				`q=${encodeURIComponent(searchText)}` +
				`&limit=30` +
				`&lang=en`,
				{
					signal: controller.signal,
				}
			);
			const data = await res.json();
			
			let results = data.features || [];
			
			// Filter to only place-related results (cities, towns, villages, states)
			results = results.filter(f => 
				f.properties.osm_key === 'place' && 
				['city', 'town', 'village', 'state', 'province', 'municipality', 'suburb'].includes(f.properties.osm_value)
			);
			
			// Transform to compatible format
			const transformed = results.map(feature => {
				// Use the romanized name from Photon
				const cityName = feature.properties.name || '';
				const stateName = feature.properties.state || '';
				const countryName = feature.properties.country || '';
				
				// Build display name
				let displayParts = [cityName];
				if (stateName && stateName !== cityName) displayParts.push(stateName);
				if (countryName) displayParts.push(countryName);
				
				return {
					display_name: displayParts.join(', '),
					lat: feature.geometry.coordinates[1],
					lon: feature.geometry.coordinates[0],
					type: feature.properties.osm_value || 'city',
					importance: feature.properties.importance || 0.5,
					address: {
						city: cityName,
						state: stateName,
						country: countryName,
					},
					addresstype: feature.properties.osm_value || 'city',
				};
			});

			// Remove duplicates
			const unique = removeDuplicates(transformed, searchText);
			
			// Calculate relevance scores and sort
			const scored = unique.map(item => ({
				...item,
				_score: calculateRelevanceScore(item, searchText)
			}));
			
			// Sort by score (highest first)
			scored.sort((a, b) => b._score - a._score);
			
			// Take top 5 results
			const topResults = scored.slice(0, 5);
			
			cacheRef.current[cacheKey] = topResults;
			setSuggestions(topResults);
		} catch (error) {
			if (error.name === 'AbortError') return;
			console.error("Search error:", error);
		} finally {
			setIsLoading(false);
			abortRef.current = null;
		}
	};

	// Show suggestions when input is focused
	const handleFocus = () => {
		setShowSuggestions(true);
		setIsFocused(true);
	};

	// Handle blur event
	const handleBlur = () => {
		setIsFocused(false);
	};

	// Hide suggestions when clicking outside
	useEffect(() => {
		function handleClickOutside(event) {
			if (
				containerRef.current &&
				!containerRef.current.contains(event.target)
			) {
				setShowSuggestions(false);
				setIsFocused(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			if (abortRef.current) abortRef.current.abort();
		};
	}, []);

	// Debounce fetchSuggestions - reduced to 150ms for faster response
	useEffect(() => {
		if (!query || query.length < 2) {
			setSuggestions([]);
			setIsLoading(false);
			return;
		}
		const debounce = setTimeout(() => fetchSuggestions(query), 150);
		return () => clearTimeout(debounce);
	}, [query]);

	// Handle suggestion selection
	const handleSelect = async (result) => {
		if (!result.lat || !result.lon) return;

		try {
			const apiRes = await fetch(`/api/timezone?lat=${encodeURIComponent(result.lat)}&lon=${encodeURIComponent(result.lon)}`);
			const apiData = await apiRes.json();
			if (apiRes.ok && (apiData.timeZone || apiData.timezone)) {
				const tzName = apiData.timeZone || apiData.timezone;
				onSearch({
					timezone: tzName,
					identifier: `${result.lat},${result.lon}`,
					city: result.display_name,
					lat: result.lat,
					lon: result.lon,
				});
			} else {
				console.warn('Timezone resolution failed', apiData);
				showErrorToast(`Could not resolve timezone for ${formatDisplayName(result.display_name)}. Please try another location.`);
			}
		} catch (err) {
			console.error('Error resolving timezone:', err);
			showErrorToast(`Failed to fetch timezone data. Please check your connection and try again.`);
		}

		setQuery("");
		setSuggestions([]);
		setShowSuggestions(false);
		setIsFocused(false);
	};

	return (
		<div className="search-container" ref={containerRef}>
			<input
				className="search-input"
				value={query}
				onChange={(e) => {
					setQuery(e.target.value);
					if (e.target.value.trim() === "") {
						setSuggestions([]);
					}
				}}
				placeholder={isFocused ? "" : "Search city or timezone..."}
				onFocus={handleFocus}
				onBlur={handleBlur}
			/>
			{isLoading && query.length >= 2 && (
				<div className="suggestions-dropdown visible">
					<div className="suggestion-item" style={{ opacity: 0.7, cursor: 'default' }}>
						Searching...
					</div>
				</div>
			)}
			{showSuggestions && !isLoading && suggestions.length > 0 && (
				<ul className="suggestions-dropdown visible">
					{suggestions.map((result, index) => (
						<li
							key={index}
							onClick={() => handleSelect(result)}
							className="suggestion-item"
						>
							{formatDisplayName(result.display_name)}
						</li>
					))}
				</ul>
			)}
			{showSuggestions && !isLoading && query.length >= 2 && suggestions.length === 0 && (
				<div className="suggestions-dropdown visible">
					<div className="suggestion-item" style={{ opacity: 0.7, cursor: 'default' }}>
						No results found
					</div>
				</div>
			)}
		</div>
	);
}
