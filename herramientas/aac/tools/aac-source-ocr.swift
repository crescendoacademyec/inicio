// Local source indexing only. No network service or external model is used.
import Foundation
import Vision
import ImageIO

var arguments = Array(CommandLine.arguments.dropFirst())
var output = FileHandle.standardOutput
if arguments.count >= 2 && arguments[0] == "--output" {
    let path = arguments[1]
    FileManager.default.createFile(atPath: path, contents: nil)
    output = try FileHandle(forWritingTo: URL(fileURLWithPath: path))
    arguments.removeFirst(2)
}
for path in arguments {
    autoreleasepool {
        var result: [String: Any] = ["file": path]
        do {
            guard let source = CGImageSourceCreateWithURL(URL(fileURLWithPath: path) as CFURL, nil),
                  let image = CGImageSourceCreateImageAtIndex(source, 0, nil) else {
                throw NSError(domain: "AACSourceOCR", code: 1, userInfo: [NSLocalizedDescriptionKey: "Unreadable image"])
            }
            let request = VNRecognizeTextRequest()
            request.recognitionLevel = .accurate
            request.usesLanguageCorrection = false
            request.recognitionLanguages = ["en-US"]
            request.minimumTextHeight = 0.004
            try VNImageRequestHandler(cgImage: image).perform([request])
            result["lines"] = (request.results ?? []).compactMap { observation -> [String: Any]? in
                guard let text = observation.topCandidates(1).first else { return nil }
                let box = observation.boundingBox
                return ["text": text.string, "confidence": text.confidence,
                        "x": box.minX, "y": box.minY, "width": box.width, "height": box.height]
            }
        } catch {
            result["error"] = error.localizedDescription
        }
        if let data = try? JSONSerialization.data(withJSONObject: result, options: [.sortedKeys]) {
            output.write(data)
            output.write(Data([10]))
        }
    }
}
