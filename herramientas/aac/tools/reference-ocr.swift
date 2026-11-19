// Batch local OCR of PDF headers. Only verification images; no network access.
import Foundation
import Vision
import PDFKit
import CoreGraphics
import ImageIO
let args=Array(CommandLine.arguments.dropFirst())
func option(_ key:String)->String?{guard let i=args.firstIndex(of:key),i+1<args.count else{return nil};return args[i+1]}
guard let filename=option("--pdf"),let outputPath=option("--output"),let doc=PDFDocument(url:URL(fileURLWithPath:filename)),let firstPage=doc.page(at:0) else{fputs("--pdf FILE --output JSONL [--start N --end N --batch N --preview PNG]\n",stderr);exit(1)}
let first=max(1,Int(option("--start") ?? "1") ?? 1),last=min(doc.pageCount,Int(option("--end") ?? "99999") ?? doc.pageCount),batchSize=max(1,Int(option("--batch") ?? "12") ?? 12)
let scale:CGFloat=1.25,headerFraction:CGFloat=0.18,bounds=(doc.page(at:first-1) ?? firstPage).bounds(for:.mediaBox),cellW=Int(bounds.width*scale),cellH=Int(bounds.height*scale*headerFraction),columns=batchSize>1 ? 2:1
FileManager.default.createFile(atPath:outputPath,contents:nil);let output=try FileHandle(forWritingTo:URL(fileURLWithPath:outputPath))
for batchStart in stride(from:first-1,to:last,by:batchSize){
 autoreleasepool{
  let started=Date(),count=min(batchSize,last-batchStart),rows=(count+columns-1)/columns,width=columns*cellW,height=rows*cellH
  var results=(0..<count).map{["pdfPage":batchStart+$0+1,"book":URL(fileURLWithPath:filename).lastPathComponent,"lines":[]] as [String:Any]}
  do{
   guard let mosaic=CGContext(data:nil,width:width,height:height,bitsPerComponent:8,bytesPerRow:0,space:CGColorSpaceCreateDeviceRGB(),bitmapInfo:CGImageAlphaInfo.noneSkipLast.rawValue) else{throw NSError(domain:"PDF",code:1)}
   mosaic.setFillColor(CGColor(gray:1,alpha:1));mosaic.fill(CGRect(x:0,y:0,width:width,height:height))
   for i in 0..<count{
    guard let page=doc.page(at:batchStart+i) else{continue};let b=page.bounds(for:.mediaBox),w=Int(b.width*scale),h=Int(b.height*scale)
    guard let context=CGContext(data:nil,width:w,height:h,bitsPerComponent:8,bytesPerRow:0,space:CGColorSpaceCreateDeviceRGB(),bitmapInfo:CGImageAlphaInfo.noneSkipLast.rawValue) else{continue}
    context.setFillColor(CGColor(gray:1,alpha:1));context.fill(CGRect(x:0,y:0,width:w,height:h));context.scaleBy(x:scale,y:scale);context.translateBy(x:-b.minX,y:-b.minY);page.draw(with:.mediaBox,to:context)
    if let image=context.makeImage(),let crop=image.cropping(to:CGRect(x:0,y:0,width:w,height:Int(CGFloat(h)*headerFraction))){mosaic.draw(crop,in:CGRect(x:(i%columns)*cellW,y:height-(i/columns+1)*cellH,width:cellW,height:cellH))}
   }
   guard let image=mosaic.makeImage() else{throw NSError(domain:"PDF",code:2)}
   if batchStart==first-1,let preview=option("--preview"),let target=CGImageDestinationCreateWithURL(URL(fileURLWithPath:preview) as CFURL,"public.png" as CFString,1,nil){CGImageDestinationAddImage(target,image,nil);CGImageDestinationFinalize(target)}
   let request=VNRecognizeTextRequest();request.recognitionLevel = .accurate;request.usesLanguageCorrection=false;request.recognitionLanguages=["en-US"];request.minimumTextHeight=0.006
   try VNImageRequestHandler(cgImage:image).perform([request])
   for observation in request.results ?? []{
    guard let text=observation.topCandidates(1).first else{continue};let b=observation.boundingBox,cx=(b.midX*CGFloat(width)),top=(1-b.midY)*CGFloat(height),col=min(columns-1,Int(cx)/cellW),row=min(rows-1,Int(top)/cellH),i=row*columns+col
    if i>=count{continue};let cellBottom=CGFloat(height-(row+1)*cellH)
    let line:[String:Any]=["text":text.string,"confidence":text.confidence,"x":(b.minX*CGFloat(width)-CGFloat(col*cellW))/CGFloat(cellW),"y":(b.minY*CGFloat(height)-cellBottom)/CGFloat(cellH),"width":b.width*CGFloat(width)/CGFloat(cellW),"height":b.height*CGFloat(height)/CGFloat(cellH)]
    var lines=results[i]["lines"] as? [[String:Any]] ?? [];lines.append(line);results[i]["lines"]=lines
   }
  }catch{for i in 0..<count{results[i]["error"]=error.localizedDescription}}
  for var result in results{result["batchSeconds"]=Date().timeIntervalSince(started);if let data=try? JSONSerialization.data(withJSONObject:result,options:[.sortedKeys]){output.write(data);output.write(Data([10]))}}
 }
}
