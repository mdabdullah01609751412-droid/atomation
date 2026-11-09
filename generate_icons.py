import zlib
import struct
import os

def create_png(width, height, output_path, r=2, g=6, b=23): # #020617 background with cyan gradient
    # PNG signature
    png = b'\x89PNG\r\n\x1a\n'
    
    # IHDR chunk
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)
    ihdr_crc = zlib.crc32(b'IHDR' + ihdr_data)
    png += struct.pack('>I', len(ihdr_data)) + b'IHDR' + ihdr_data + struct.pack('>I', ihdr_crc)
    
    # Raw image data (RGB)
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0) # Filter type 0
        for x in range(width):
            # Center circular emblem
            cx, cy = width / 2, height / 2
            dist = ((x - cx)**2 + (y - cy)**2)**0.5
            if dist < width * 0.35:
                # Cyan / Blue badge
                raw_data.extend([56, 189, 248]) # #38bdf8
            elif dist < width * 0.42:
                # Accent ring
                raw_data.extend([37, 99, 235]) # #2563eb
            else:
                # Dark slate background #020617
                raw_data.extend([r, g, b])
                
    compressed = zlib.compress(bytes(raw_data), 9)
    idat_crc = zlib.crc32(b'IDAT' + compressed)
    png += struct.pack('>I', len(compressed)) + b'IDAT' + compressed + struct.pack('>I', idat_crc)
    
    # IEND chunk
    iend_crc = zlib.crc32(b'IEND')
    png += struct.pack('>I', 0) + b'IEND' + struct.pack('>I', iend_crc)
    
    os.makedirs(os.path.dirname(output_path), exist_ok=True)
    with open(output_path, 'wb') as f:
        f.write(png)
    print(f"Generated {output_path} ({width}x{height})")

if __name__ == '__main__':
    create_png(192, 192, 'public/pwa-192x192.png')
    create_png(512, 512, 'public/pwa-512x512.png')
    create_png(512, 512, 'public/pwa-maskable-512x512.png')
    create_png(180, 180, 'public/apple-touch-icon.png')
    create_png(64, 64, 'public/favicon.ico')
