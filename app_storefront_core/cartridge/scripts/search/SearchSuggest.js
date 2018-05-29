'use strict';

var SuggestModel = require('dw/suggest/SuggestModel');
var ArrayList = require('dw/util/ArrayList');

function getProductSuggestions(suggestModel) {
	var suggestions = suggestModel.getProductSuggestions();
	var searchPhrasesSuggestions = suggestions.getSearchPhraseSuggestions();
	if (!suggestions) {
		return {
			available: false
		};
	}
	return {
		available: suggestions.hasSuggestions(),
		terms: searchPhrasesSuggestions.getSuggestedTerms(),
		products: suggestions.getSuggestedProducts(),
		phrases: searchPhrasesSuggestions.getSuggestedPhrases()
	};
}

function getBrandSuggestions(suggestModel) {
	var suggestions = suggestModel.getBrandSuggestions();
	if (!suggestions) {
		return {
			available: false
		};
	}
	return {
		available: suggestions.getSearchPhraseSuggestions().hasSuggestedPhrases(),
		phrases: suggestions.getSearchPhraseSuggestions().getSuggestedPhrases()
	};
}

function getContentSuggestions(suggestModel) {
	var suggestions = suggestModel.getContentSuggestions();
	if (!suggestions) {
		return {
			available: false
		};
	}
	return {
		available: suggestions.hasSuggestions(),
		content: suggestions.getSuggestedContent()
	};
}

function getCategorySuggestions(suggestModel) {
	var suggestions = suggestModel.getCategorySuggestions();
	if (!suggestions) {
		return {
			available: false
		};
	}
	return {
		available: suggestions.hasSuggestions(),
		phrases: suggestions.getSearchPhraseSuggestions().getSuggestedPhrases(),
		categories: suggestions.getSuggestedCategories()
	};
}

function getCustomSuggestions(suggestModel) {
	var suggestions = suggestModel.getCustomSuggestions();
	if (!suggestions) {
		return {
			available: false
		};
	}

	// filter custom phrase that matches exactly the suggested search phrase for products
	var customPhrasesUnfiltered = suggestions.getSearchPhraseSuggestions().getSuggestedPhrases();
	var customPhrasesFiltered;

	var productSuggestions = suggestModel.getProductSuggestions();
    if (productSuggestions && productSuggestions.getSearchPhraseSuggestions().hasSuggestedPhrases()) {
        var productPhrase = productSuggestions.getSearchPhraseSuggestions().getSuggestedPhrases().next().getPhrase();
        var filtered = new ArrayList();
        while (customPhrasesUnfiltered.hasNext()) {
            var customPhrase = customPhrasesUnfiltered.next();
            if (!productPhrase.toUpperCase().equals(customPhrase.getPhrase().toUpperCase())) {
                filtered.push(customPhrase);
            }
        }
        customPhrasesFiltered = filtered.iterator();
    } else {
        // no product suggestions, just pass the custom phrase unfiltered
        customPhrasesFiltered = customPhrasesUnfiltered;
    }

	return {
		available: customPhrasesFiltered.hasNext(),
		phrases: customPhrasesFiltered
	};
}

function getRecentSearchPhrases(suggestModel) {
	var recentSearchPhrases = suggestModel.getRecentSearchPhrases();
	if (!recentSearchPhrases) {
		return {
			available: false
		};
	}
	return {
		available: recentSearchPhrases.hasNext(),
		phrases: recentSearchPhrases
	};
}

function getPopularSearchPhrases(suggestModel) {
	var popularSearchPhrases = suggestModel.getPopularSearchPhrases();
	if (!popularSearchPhrases) {
		return {
			available: false
		};
	}
	return {
		available: popularSearchPhrases.hasNext(),
		phrases: popularSearchPhrases
	};
}

module.exports = function (searchPhrase, maxSuggestions) {
	var suggestModel = new SuggestModel();
	suggestModel.setSearchPhrase(searchPhrase);
	suggestModel.setMaxSuggestions(maxSuggestions);
	if (!suggestModel) {
		return;
	}

	var product = getProductSuggestions(suggestModel);
	var brand = getBrandSuggestions(suggestModel);
	var category = getCategorySuggestions(suggestModel);
	var content = getContentSuggestions(suggestModel);
	var custom = getCustomSuggestions(suggestModel);
	var recent = getRecentSearchPhrases(suggestModel);
	var popular = getPopularSearchPhrases(suggestModel);

	return {
		product: product,
		brand: brand,
		category: category,
		content: content,
		custom: custom,
		recent: recent,
		popular: popular
	};
};
