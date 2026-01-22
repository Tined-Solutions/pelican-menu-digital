// tailwind.config.js
tailwind.config = {
    theme: {
        extend: {
            colors: {
                pelican: {
                    base: '#050505',
                    surface: '#0F0F0F',
                    border: '#27272a',
                    gold: '#D4AF37',
                    accent: '#F59E0B',
                    text: '#E5E7EB',
                    muted: '#9CA3AF',
                    leaf: '#1A4228', 
                    orange: '#FF9F43',
                }
            },
            fontFamily: {
                sans: ['"DM Sans"', 'sans-serif'],
                serif: ['"Playfair Display"', 'serif'],
                display: ['"Space Grotesk"', 'sans-serif'],
                overpass: ['"Overpass"', 'sans-serif'],
                limelight: ['"Limelight"', 'cursive'],
            },
            backgroundImage: {
                'bottom-shade': 'linear-gradient(to top, #050505 0%, transparent 60%)',
            },
            boxShadow: {
                'gold-glow': '0 4px 20px -5px rgba(212, 175, 55, 0.15)',
            }
        }
    }
}