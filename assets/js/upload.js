const API_URL = "<https://api.openai.com/v1/chat/completions>";
document.addEventListener('DOMContentLoaded', () => {
    const imageInput = document.getElementById('imageInput');
    const imagePreview = document.getElementById('imagePreview');
    const dominantColorBox = document.getElementById('dominantColor');
    const dominantColorHex = document.getElementById('dominantColorHex');
    const colorPalette = document.getElementById('colorPalette');
    const resetButton = document.getElementById('resetButton');
    const colorThief = new ColorThief();

    let extractedColors = [];
    // Function to convert RGB to HEX
    function rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }
    function detectCurrentSeason() {
        const now = new Date();
        const month = now.getMonth(); // 0-11 (Jan-Dec)
        
        // Northern Hemisphere seasons
        if (month >= 2 && month <= 4) return "spring";  // Mar-May
        if (month >= 5 && month <= 7) return "summer";  // Jun-Aug
        if (month >= 8 && month <= 10) return "fall";   // Sep-Nov
        return "winter";                                // Dec-Feb
    }
    const currentSeason = detectCurrentSeason();
    // Function to display colors
    function displayColors(image) {
        // Reset extracted colors array
        extractedColors = [];
        
        // Get dominant color
        const dominantColor = colorThief.getColor(image);
        const dominantHex = rgbToHex(...dominantColor);
        
        // Add dominant color to extracted colors
        extractedColors.push(dominantHex);
        
        // Display dominant color
        dominantColorBox.style.backgroundColor = `rgb(${dominantColor.join(',')})`;
        dominantColorHex.textContent = dominantHex;

        // Get color palette
        const palette = colorThief.getPalette(image, 5);
        
        // Clear previous palette
        colorPalette.innerHTML = '';
        
        // Display palette colors
        palette.forEach(color => {
            const colorHex = rgbToHex(...color);
            
            // Add palette color to extracted colors
            extractedColors.push(colorHex);
            
            // Create container div for each color
            const colorContainer = document.createElement('div');
            colorContainer.className = 'palette-color-wrapper';
            
            // Create color box
            const colorDiv = document.createElement('div');
            colorDiv.className = 'palette-color';
            colorDiv.style.backgroundColor = `rgb(${color.join(',')})`;
            colorDiv.title = colorHex;
            
            // Create hex text
            const hexDiv = document.createElement('div');
            hexDiv.className = 'color-hex palette-hex';
            hexDiv.textContent = colorHex;
            
            // Add elements to container
            colorContainer.appendChild(colorDiv);
            colorContainer.appendChild(hexDiv);
            
            // Add to palette
            colorPalette.appendChild(colorContainer);
        });
        
        // Show fashion suggestions section
        fashionSection.style.display = 'block';
    }
    
    // Function to reset the form
    function resetForm() {
        // Clear file input
        imageInput.value = '';
        
        // Hide image preview
        imagePreview.style.display = 'none';
        imagePreview.src = '';
        
        // Reset dominant color
        dominantColorBox.style.backgroundColor = 'transparent';
        dominantColorHex.textContent = '';
        
        // Clear color palette
        colorPalette.innerHTML = '';

        extractedColors = [];
        fashionSection.style.display = 'none';
        suggestionsContent.innerHTML = '';
    }

    // Handle image upload
    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                imagePreview.src = e.target.result;
                imagePreview.style.display = 'block';
                
                // Wait for image to load before extracting colors
                imagePreview.onload = () => {
                    displayColors(imagePreview);
                };
            };
            
            reader.readAsDataURL(file);
        }
    });
    
    // Handle reset button click
    resetButton.addEventListener('click', resetForm);

    async function getFashionSuggestions() {
        if (extractedColors.length === 0) {
            alert('Please upload an image first to extract colors.');
            return;
        }
        
        // Show loading indicator
        loadingIndicator.style.display = 'block';
        suggestionsContent.innerHTML = '';
        
        try {
            const colorsList = extractedColors.join(', ');
            const prompt = `Based on this color palette: ${colorsList}, suggest outfit combinations and clothing items that would work well for ${currentSeason} season, considering current fashion trends. Include specific items like tops, bottoms, accessories, and shoes.`;

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {
                            role: "user", 
                            content: prompt
                        }
                    ],
                    temperature: 0.7
                })
            });
            
            // Check if response is ok
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            // Parse response
            const data = await response.json();
            const aiSuggestion = data.choices[0].message.content;
            
            // Hide loading indicator
            loadingIndicator.style.display = 'none';
            
            // Display suggestions
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
            suggestionsContent.innerHTML = `<p class="error-message">Error: ${error.message}. Please try again later.</p>`;
        }
    
    }

});
