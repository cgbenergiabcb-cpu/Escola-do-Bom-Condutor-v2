import zlib
import struct
import math
import os

def create_png(width, height, filename, is_maskable=False):
    # PNG signature
    png = b'\x89PNG\r\n\x1a\n'
    
    # IHDR chunk
    # Width (4 bytes), Height (4 bytes), Bit depth (1 byte: 8), Color type (1 byte: 6 = RGBA),
    # Compression (1 byte: 0), Filter (1 byte: 0), Interlace (1 byte: 0)
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    ihdr_crc = zlib.crc32(b'IHDR' + ihdr_data) & 0xffffffff
    ihdr_chunk = struct.pack('>I', len(ihdr_data)) + b'IHDR' + ihdr_data + struct.pack('>I', ihdr_crc)
    
    # Raster image data
    # Color constants
    bg_r, bg_g, bg_b = 0x10, 0x1C, 0x2C  # Deep navy
    accent_r, accent_g, accent_b = 0x16, 0x77, 0xFF  # Tech blue
    cyan_r, cyan_g, cyan_b = 0x36, 0xD6, 0xE7  # Cyan
    white_r, white_g, white_b = 0xFF, 0xFF, 0xFF
    
    raw_data = bytearray()
    center_x = width / 2.0
    center_y = height / 2.0
    radius = min(width, height) * (0.35 if is_maskable else 0.42)
    inner_radius = radius * 0.7
    
    for y in range(height):
        raw_data.append(0)  # Filter type: 0 (None)
        for x in range(width):
            dx = x - center_x
            dy = y - center_y
            dist = math.sqrt(dx * dx + dy * dy)
            
            # Draw shield/circle motif
            if dist < inner_radius * 0.4:
                # Center wheel hub
                r, g, b, a = cyan_r, cyan_g, cyan_b, 255
            elif abs(dist - inner_radius) < (width * 0.04):
                # Inner steering rim
                r, g, b, a = white_r, white_g, white_b, 255
            elif dist < radius:
                # Shield background
                blend = (dist / radius)
                r = int(bg_r * (1 - blend) + accent_r * blend * 0.6)
                g = int(bg_g * (1 - blend) + accent_g * blend * 0.6)
                b = int(bg_b * (1 - blend) + accent_b * blend * 0.6)
                a = 255
            elif dist < radius + (width * 0.03):
                # Shield border
                r, g, b, a = accent_r, accent_g, accent_b, 255
            else:
                # Outer background
                r, g, b, a = bg_r, bg_g, bg_b, 255
            
            raw_data.extend([r, g, b, a])
            
    compressed = zlib.compress(bytes(raw_data), 9)
    idat_crc = zlib.crc32(b'IDAT' + compressed) & 0xffffffff
    idat_chunk = struct.pack('>I', len(compressed)) + b'IDAT' + compressed + struct.pack('>I', idat_crc)
    
    # IEND chunk
    iend_crc = zlib.crc32(b'IEND') & 0xffffffff
    iend_chunk = struct.pack('>I', 0) + b'IEND' + struct.pack('>I', iend_crc)
    
    os.makedirs(os.path.dirname(filename), exist_ok=True)
    with open(filename, 'wb') as f:
        f.write(png + ihdr_chunk + idat_chunk + iend_chunk)
    print(f"Created {filename} ({width}x{height})")

create_png(192, 192, 'public/pwa-192x192.png', is_maskable=False)
create_png(512, 512, 'public/pwa-512x512.png', is_maskable=False)
create_png(512, 512, 'public/pwa-maskable-512x512.png', is_maskable=True)
create_png(180, 180, 'public/apple-touch-icon.png', is_maskable=False)
