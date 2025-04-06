// DOM Elements
const imageInput = document.getElementById('imageInput');
const imagePreview = document.getElementById('imagePreview');
const resetButton = document.getElementById('resetButton');
const dominantColor = document.getElementById('dominantColor');
const dominantColorHex = document.getElementById('dominantColorHex');
const colorPalette = document.getElementById('colorPalette');
const fashionSection = document.querySelector('.fashion-section');
const seasonSelect = document.getElementById('seasonSelect');
const getFashionSuggestionsButton = document.getElementById('getFashionSuggestions');
const fashionSuggestions = document.getElementById('fashionSuggestions');
const loadingIndicator = document.querySelector('.loading-indicator');
const suggestionsContent = document.querySelector('.suggestions-content');

// Global variables
let extractedColors = [];
let currentSeason = 'spring'; // Default season

// Initial setup - hide fashion section until image is uploaded
document.addEventListener('DOMContentLoaded', function() {
    // Hide fashion section initially if it's not hidden in HTML
    if (fashionSection.style.display !== 'none') {
        fashionSection.style.display = 'none';
    }
});

// Event Listeners
imageInput.addEventListener('change', handleImageUpload);
resetButton.addEventListener('click', resetAll);
seasonSelect.addEventListener('change', (e) => {
    currentSeason = e.target.value;
});
getFashionSuggestionsButton.addEventListener('click', getFashionSuggestions);

// Function to handle image upload
function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(event) {
        imagePreview.src = event.target.result;
        imagePreview.style.display = 'block';
        
        // Extract colors when image is loaded
        imagePreview.onload = function() {
            extractColors(imagePreview);
            fashionSection.style.display = 'block'; // Show fashion section after colors are extracted
        };
    };
    reader.readAsDataURL(file);
}

// Function to extract colors using Color Thief
function extractColors(image) {
    const colorThief = new ColorThief();
    
    try {
        // Get dominant color
        const dominantRGB = colorThief.getColor(image);
        const dominantHex = rgbToHex(dominantRGB[0], dominantRGB[1], dominantRGB[2]);
        dominantColor.style.backgroundColor = dominantHex;
        dominantColorHex.textContent = dominantHex;
        
        // Get color palette (8 colors)
        const palette = colorThief.getPalette(image, 8);
        colorPalette.innerHTML = '';
        extractedColors = []; // Reset extracted colors
        
        palette.forEach(rgb => {
            const hex = rgbToHex(rgb[0], rgb[1], rgb[2]);
            extractedColors.push(hex);
            
            const colorWrapper = document.createElement('div');
            colorWrapper.className = 'palette-color-wrapper';
            
            const colorDiv = document.createElement('div');
            colorDiv.className = 'palette-color';
            colorDiv.style.backgroundColor = hex;
            
            const hexText = document.createElement('div');
            hexText.className = 'palette-hex';
            hexText.textContent = hex;
            
            colorWrapper.appendChild(colorDiv);
            colorWrapper.appendChild(hexText);
            colorPalette.appendChild(colorWrapper);
        });
    } catch (error) {
        console.error('Error extracting colors:', error);
        alert('Error extracting colors. Please try another image.');
    }
}

// Function to convert RGB to HEX
function rgbToHex(r, g, b) {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

// Function to reset all
function resetAll() {
    imageInput.value = '';
    imagePreview.src = '';
    imagePreview.style.display = 'none';
    dominantColor.style.backgroundColor = '';
    dominantColorHex.textContent = '';
    colorPalette.innerHTML = '';
    fashionSection.style.display = 'none';
    suggestionsContent.innerHTML = '';
    extractedColors = [];
}

// Function to get fashion suggestions from OpenAI API
async function getFashionSuggestions() {
    if (extractedColors.length === 0) {
        alert('Please upload an image first to extract colors.');
        return;
    }
    
    // Show loading indicator
    loadingIndicator.style.display = 'flex';
    suggestionsContent.innerHTML = '';
    
    try {
        const colorsList = extractedColors.join(', ');
        const prompt = `Based on this color palette: ${colorsList}, suggest outfit combinations and clothing items that would work well for ${currentSeason} season, considering current fashion trends. Include specific items like tops, bottoms, accessories, and shoes. Provide complete outfit ideas using these colors.`;
        
        // Use OpenAI API
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer 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' // Replace with your OpenAI API key
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                max_tokens: 1024,
                temperature: 0.7
            })
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        const aiSuggestion = data.choices[0].message.content;
        
        // Hide loading indicator
        loadingIndicator.style.display = 'none';
        
        // Display formatted suggestions
        suggestionsContent.innerHTML = `
            <div class="ai-suggestion">
                <h3>Fashion Suggestions for ${currentSeason.charAt(0).toUpperCase() + currentSeason.slice(1)}</h3>
                <div class="suggestion-text">
                    ${formatAIResponse(aiSuggestion)}
                </div>
            </div>
        `;
    } catch (error) {
        console.error('Error getting fashion suggestions:', error);
        loadingIndicator.style.display = 'none';
        
        // Use fallback suggestions on API error
        const fallbackSuggestion = generateFallbackSuggestion(currentSeason);
        suggestionsContent.innerHTML = `
            <div class="ai-suggestion">
                <h3>Fashion Suggestions for ${currentSeason.charAt(0).toUpperCase() + currentSeason.slice(1)}</h3>
                <div class="suggestion-text">
                    ${formatAIResponse(fallbackSuggestion)}
                </div>
            </div>
        `;
    }
}

// Function to format AI response with better HTML
function formatAIResponse(text) {
    // Replace markdown headers with HTML
    let formatted = text.replace(/#+\s+(.*)/g, '<h4>$1</h4>');
    
    // Process lists and paragraphs
    let lines = formatted.split(' ');
    let inList = false;
    let result = [];
    let paragraphText = '';
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        
        if (line === '') {
            // Empty line - end paragraph if needed
            if (paragraphText) {
                result.push(`<p>${paragraphText}</p>`);
                paragraphText = '';
            }
        } else if (line.startsWith('- ')) {
            // Bullet point
            if (paragraphText) {
                result.push(`<p>${paragraphText}</p>`);
                paragraphText = '';
            }
            
            if (!inList) {
                result.push('<ul>');
                inList = true;
            }
            result.push('<li>' + line.substring(2) + '</li>');
        } else if (line.match(/^<h4>/)) {
            // It's a header we converted earlier
            if (paragraphText) {
                result.push(`<p>${paragraphText}</p>`);
                paragraphText = '';
            }
            
            if (inList) {
                result.push('</ul>');
                inList = false;
            }
            
            result.push(line);
        } else {
            // Regular text
            if (inList) {
                result.push('</ul>');
                inList = false;
            }
            
            // Bold important terms
            const boldedLine = line.replace(/\b(Color Palette Analysis|Style Analysis|Tops|Bottoms|Dresses|Outerwear|Accessories|Shoes|Outfits|Combinations|Look \d+|Complete Looks|Styling Tips):/g, '<strong>$1:</strong>');
            
            if (paragraphText) {
                paragraphText += ' ' + boldedLine;
            } else {
                paragraphText = boldedLine;
            }
        }
    }
    
    // Add any remaining paragraph text
    if (paragraphText) {
        result.push(`<p>${paragraphText}</p>`);
    }
    
    // Close any open list
    if (inList) {
        result.push('</ul>');
    }
    
    return result.join(' ');
}

// Fallback function for generating suggestions if API fails
function generateFallbackSuggestion(season) {
    const fallbackOutfits = {
        spring: `
            <h4>Outfit 1: Casual Spring Look</h4>
            <ul>
                <li><strong>Tops:</strong> Lightweight shirt in <span style="color: #DECCA6;">#DECCA6</span> or <span style="color: #DDD7C3;">#DDD7C3</span>.</li>
                <li><strong>Bottoms:</strong> Beige chinos or light khakis.</li>
                <li><strong>Accessories:</strong> Leather watch strap in <span style="color: #342C2B;">#342C2B</span>.</li>
                <li><strong>Shoes:</strong> White sneakers or loafers.</li>
            </ul>

            <h4>Outfit 2: Smart-Casual</h4>
            <ul>
                <li><strong>Tops:</strong> Knit sweater in <span style="color: #956354;">#956354</span>.</li>
                <li><strong>Bottoms:</strong> Dark gray trousers.</li>
                <li><strong>Accessories:</strong> Scarf in <span style="color: #643D33;">#643D33</span>.</li>
                <li><strong>Shoes:</strong> Tan brogues.</li>
            </ul>

            <h4>Outfit 3: Layered Spring Look</h4>
            <ul>
                <li><strong>Tops:</strong> Denim jacket over a tee in <span style="color: #7A4C34;">#7A4C34</span>.</li>
                <li><strong>Bottoms:</strong> Light wash jeans.</li>
                <li><strong>Accessories:</strong> Canvas tote in <span style="color: #BEA286;">#BEA286</span>.</li>
                <li><strong>Shoes:</strong> Espadrilles or boat shoes.</li>
            </ul>
        `,
        summer: `
            <h4>Outfit 1: Beach-Ready</h4>
            <ul>
                <li><strong>Tops:</strong> Linen shirt in <span style="color: #DDD7C3;">#DDD7C3</span>.</li>
                <li><strong>Bottoms:</strong> Light shorts in <span style="color: #DECCA6;">#DECCA6</span>.</li>
                <li><strong>Accessories:</strong> Straw hat and sunglasses.</li>
                <li><strong>Shoes:</strong> Sandals or flip-flops.</li>
            </ul>

            <h4>Outfit 2: Summer Evening</h4>
            <ul>
                <li><strong>Tops:</strong> Short-sleeve polo in <span style="color: #643D33;">#643D33</span>.</li>
                <li><strong>Bottoms:</strong> White linen trousers.</li>
                <li><strong>Accessories:</strong> Leather bracelet in <span style="color: #342C2B;">#342C2B</span>.</li>
                <li><strong>Shoes:</strong> Loafers or slip-ons.</li>
            </ul>

            <h4>Outfit 3: Poolside Casual</h4>
            <ul>
                <li><strong>Tops:</strong> Tank top in <span style="color: #956354;">#956354</span>.</li>
                <li><strong>Bottoms:</strong> Swim trunks with a print.</li>
                <li><strong>Accessories:</strong> Waterproof watch.</li>
                <li><strong>Shoes:</strong> Slides or barefoot.</li>
            </ul>
        `,
        fall: `
            <h4>Outfit 1: Classic Autumn</h4>
            <ul>
                <li><strong>Tops:</strong> Flannel shirt in <span style="color: #695952;">#695952</span>.</li>
                <li><strong>Bottoms:</strong> Dark jeans or corduroys.</li>
                <li><strong>Accessories:</strong> Wool beanie in <span style="color: #342C2B;">#342C2B</span>.</li>
                <li><strong>Shoes:</strong> Leather boots.</li>
            </ul>

            <h4>Outfit 2: Layered Fall Look</h4>
            <ul>
                <li><strong>Tops:</strong> Sweater in <span style="color: #7A4C34;">#7A4C34</span> over a tee.</li>
                <li><strong>Bottoms:</strong> Olive chinos.</li>
                <li><strong>Accessories:</strong> Leather gloves.</li>
                <li><strong>Shoes:</strong> Chelsea boots.</li>
            </ul>

            <h4>Outfit 3: Cozy Weekend</h4>
            <ul>
                <li><strong>Tops:</strong> Hoodie in <span style="color: #643D33;">#643D33</span>.</li>
                <li><strong>Bottoms:</strong> Joggers or relaxed-fit pants.</li>
                <li><strong>Accessories:</strong> Knit scarf in <span style="color: #BEA286;">#BEA286</span>.</li>
                <li><strong>Shoes:</strong> Sneakers or moccasins.</li>
            </ul>
        `,
        winter: `
            <h4>Outfit 1: Winter Formal</h4>
            <ul>
                <li><strong>Tops:</strong> Wool coat in <span style="color: #342C2B;">#342C2B</span> over a turtleneck.</li>
                <li><strong>Bottoms:</strong> Charcoal trousers.</li>
                <li><strong>Accessories:</strong> Cashmere scarf in <span style="color: #956354;">#956354</span>.</li>
                <li><strong>Shoes:</strong> Oxfords or dress boots.</li>
            </ul>

            <h4>Outfit 2: Casual Warmth</h4>
            <ul>
                <li><strong>Tops:</strong> Puffer jacket in <span style="color: #643D33;">#643D33</span>.</li>
                <li><strong>Bottoms:</strong> Dark denim or thermal pants.</li>
                <li><strong>Accessories:</strong> Fleece-lined gloves.</li>
                <li><strong>Shoes:</strong> Snow boots or Timberlands.</li>
            </ul>

            <h4>Outfit 3: Layered Winter</h4>
            <ul>
                <li><strong>Tops:</strong> Chunky knit sweater in <span style="color: #BEA286;">#BEA286</span>.</li>
                <li><strong>Bottoms:</strong> Wool-blend trousers.</li>
                <li><strong>Accessories:</strong> Felt fedora in <span style="color: #695952;">#695952</span>.</li>
                <li><strong>Shoes:</strong> Leather lace-up boots.</li>
            </ul>
        `
    };
    return fallbackOutfits[season] || 'No suggestions available for this season.';
}




