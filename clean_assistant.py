import re

# Read the original file
with open('index.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove old GeckoBot button (lines 110-149 approximately)
content = re.sub(r'<!-- GECKO BOT.*?</div>\s*', '', content, flags=re.DOTALL)

# Remove old gecko-assistant divs (both instances)
content = re.sub(r'<div id="gecko-assistant".*?</div>\s*</div>\s*</div>', '', content, flags=re.DOTALL)

# Remove toggleGeckoChat function
content = re.sub(r'// NUEVA función simplificada para el gecko.*?}\s*}\s*', '', content, flags=re.DOTALL)
content = re.sub(r'function toggleGeckoChat\(\).*?}\s*', '', content, flags=re.DOTALL)

# Remove GeckoBot creation script at the end
content = re.sub(r'// Create and inject GeckoBot.*?}\)\(\);\s*</script>', '</script>', content, flags=re.DOTALL)

# Remove all CSS related to gecko-assistant-btn
content = re.sub(r'#gecko-assistant-btn.*?}\s*', '', content, flags=re.DOTALL)
content = re.sub(r'\.gecko-assistant-btn.*?}\s*', '', content, flags=re.DOTALL)

# Remove gecko-mega animations that were specific to GeckoBot
content = re.sub(r'@keyframes gecko-mega.*?}\s*', '', content, flags=re.DOTALL)

# Add new floating assistant before closing body tag
new_assistant = '''
    <!-- New Floating Assistant -->
    <style>
        .omni-assistant-btn {
            position: fixed !important;
            bottom: 20px !important;
            right: 20px !important;
            width: 60px !important;
            height: 60px !important;
            border-radius: 50% !important;
            background: linear-gradient(135deg, #10b981, #059669) !important;
            border: 3px solid #ffd700 !important;
            cursor: pointer !important;
            z-index: 999999 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4) !important;
            transition: transform 0.3s !important;
        }
        
        .omni-assistant-btn:hover {
            transform: scale(1.1) !important;
        }
        
        .omni-assistant-chat {
            position: fixed !important;
            bottom: 90px !important;
            right: 20px !important;
            width: 380px !important;
            height: 500px !important;
            background: linear-gradient(135deg, #0f172a, #1e293b) !important;
            border-radius: 16px !important;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8) !important;
            z-index: 999998 !important;
            display: none !important;
            flex-direction: column !important;
            border: 2px solid #10b981 !important;
        }
        
        .omni-assistant-chat.active {
            display: flex !important;
        }
    </style>
    
    <button class="omni-assistant-btn" id="omni-assistant-btn" onclick="toggleAssistant()">
        <span style="font-size: 30px;">🦎</span>
    </button>
    
    <div class="omni-assistant-chat" id="omni-assistant-chat">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 15px; border-radius: 14px 14px 0 0; display: flex; justify-content: space-between; align-items: center;">
            <h3 style="margin: 0; color: white; font-size: 18px;">🦎 Omniverse Assistant</h3>
            <button onclick="toggleAssistant()" style="background: none; border: none; color: white; font-size: 24px; cursor: pointer;">✕</button>
        </div>
        <div style="flex: 1; padding: 20px; overflow-y: auto; color: white;">
            <p>Welcome! How can I help you today?</p>
            <ul style="margin-top: 10px;">
                <li>🎮 Game mechanics</li>
                <li>💎 NFT collections</li>
                <li>🪙 Tokenomics</li>
                <li>📈 Investment info</li>
            </ul>
        </div>
        <div style="padding: 15px; border-top: 1px solid rgba(255,255,255,0.1);">
            <input type="text" placeholder="Type your message..." style="width: 100%; padding: 10px; border-radius: 20px; border: 1px solid #10b981; background: rgba(255,255,255,0.05); color: white;">
        </div>
    </div>
    
    <script>
        function toggleAssistant() {
            const chat = document.getElementById('omni-assistant-chat');
            chat.classList.toggle('active');
        }
        
        // Ensure button stays fixed
        window.addEventListener('load', function() {
            const btn = document.getElementById('omni-assistant-btn');
            if (btn) {
                setInterval(() => {
                    btn.style.position = 'fixed';
                    btn.style.bottom = '20px';
                    btn.style.right = '20px';
                    btn.style.zIndex = '999999';
                }, 500);
            }
        });
    </script>
'''

# Insert new assistant before </body>
content = content.replace('</body>', new_assistant + '\n</body>')

# Write cleaned content
with open('index_clean.html', 'w', encoding='utf-8') as f:
    f.write(content)

print("Cleaned index.html saved as index_clean.html")