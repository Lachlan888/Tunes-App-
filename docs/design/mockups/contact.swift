import AppKit
import Foundation

let dir = URL(fileURLWithPath: CommandLine.arguments[1], isDirectory: true)
let pages = [
  ("Home", "home"), ("Practice", "practice"),
  ("Practice finish · optional invitation", "practice_finish"), ("Practice Diary", "diary"),
  ("Tunes", "tunes"), ("Tune · Info", "tune"),
  ("Tune · Reference", "reference"), ("Lists", "lists"),
  ("List reader", "list"), ("Compare", "compare"),
  ("Social", "social"), ("Festival · only when enabled", "festival")
]
let width = 1472
let height = 2934
let tileWidth: CGFloat = 690
let tileHeight: CGFloat = 431.25
guard let rep = NSBitmapImageRep(bitmapDataPlanes: nil, pixelsWide: width, pixelsHigh: height,
                                 bitsPerSample: 8, samplesPerPixel: 4, hasAlpha: true,
                                 isPlanar: false, colorSpaceName: .deviceRGB,
                                 bytesPerRow: 0, bitsPerPixel: 0),
      let context = NSGraphicsContext(bitmapImageRep: rep) else { fatalError("bitmap") }
NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = context
NSColor(calibratedRed: 0.965, green: 0.953, blue: 0.929, alpha: 1).setFill()
NSRect(x: 0, y: 0, width: width, height: height).fill()
for (index, page) in pages.enumerated() {
  let col = index % 2
  let row = index / 2
  let x = CGFloat(24 + col * 714)
  let top = CGFloat(19 + row * 484)
  let y = CGFloat(height) - top - 30 - tileHeight
  guard let image = NSImage(contentsOf: dir.appendingPathComponent(page.1 + ".png")) else { fatalError(page.1) }
  image.draw(in: NSRect(x: x, y: y, width: tileWidth, height: tileHeight),
             from: .zero, operation: .copy, fraction: 1)
  let font = NSFont.systemFont(ofSize: 19, weight: .semibold)
  NSString(string: page.0).draw(in: NSRect(x: x, y: y + tileHeight + 4, width: tileWidth, height: 25),
                                withAttributes: [.font: font, .foregroundColor: NSColor(calibratedRed: 0.12, green: 0.16, blue: 0.15, alpha: 1)])
}
context.flushGraphics()
NSGraphicsContext.restoreGraphicsState()
guard let data = rep.representation(using: .png, properties: [:]) else { fatalError("png") }
try data.write(to: dir.appendingPathComponent("overview.png"))
print("Rendered overview.png")
