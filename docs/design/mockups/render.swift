import AppKit
import Foundation

let W: CGFloat = 1440
let H: CGFloat = 900
let out = URL(fileURLWithPath: CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : ".", isDirectory: true)
try FileManager.default.createDirectory(at: out, withIntermediateDirectories: true)

let c: [String: String] = [
  "canvas":"F7F4ED", "paper":"FFFEFA", "ink":"202725", "muted":"69716B",
  "line":"DEDBD2", "teal":"285D65", "tealSoft":"E5F0EE", "rust":"A85E47",
  "rustSoft":"F6E9E3", "moss":"4D684C", "mossSoft":"E8EEE5", "ochre":"A87935",
  "ochreSoft":"F4EEDF", "rail":"FBFAF6", "plum":"67576B", "soft":"F3F1EA"
]
func color(_ key: String) -> NSColor {
  let hex = c[key] ?? key
  let n = Int(hex, radix: 16) ?? 0
  return NSColor(calibratedRed: CGFloat((n >> 16) & 255)/255, green: CGFloat((n >> 8) & 255)/255, blue: CGFloat(n & 255)/255, alpha: 1)
}
func box(_ x: CGFloat,_ y: CGFloat,_ w: CGFloat,_ h: CGFloat,_ fill: String = "paper",_ radius: CGFloat = 0,_ stroke: String? = nil) {
  let p = NSBezierPath(roundedRect: NSRect(x:x,y:H-y-h,width:w,height:h), xRadius:radius,yRadius:radius)
  color(fill).setFill(); p.fill()
  if let st = stroke { color(st).setStroke(); p.lineWidth = 1; p.stroke() }
}
func rule(_ x: CGFloat,_ y: CGFloat,_ w: CGFloat,_ shade: String = "line") { box(x,y,w,1,shade) }
func label(_ s: String,_ x: CGFloat,_ y: CGFloat,_ w: CGFloat,_ h: CGFloat,_ size: CGFloat = 15,_ shade: String = "ink",_ weight: String = "regular") {
  let font: NSFont
  switch weight {
  case "serif": font = NSFont(name:"Georgia-Bold",size:size) ?? .systemFont(ofSize:size,weight:.bold)
  case "medium": font = .systemFont(ofSize:size,weight:.medium)
  case "bold": font = .systemFont(ofSize:size,weight:.bold)
  default: font = .systemFont(ofSize:size)
  }
  let p=NSMutableParagraphStyle(); p.lineBreakMode = .byWordWrapping; p.minimumLineHeight = size*1.12
  NSString(string:s).draw(in:NSRect(x:x,y:H-y-h,width:w,height:h),withAttributes:[.font:font,.foregroundColor:color(shade),.paragraphStyle:p])
}
func pill(_ s:String,_ x:CGFloat,_ y:CGFloat,_ fill:String="soft",_ ink:String="muted") -> CGFloat {
  let w=max(68,CGFloat(s.count)*6.2+24)
  box(x,y,w,27,fill,13.5); label(s,x+12,y+5,w-20,17,11,ink,"bold"); return w
}
func button(_ s:String,_ x:CGFloat,_ y:CGFloat,_ w:CGFloat,_ primary:Bool=true) {
  box(x,y,w,42,primary ? "teal":"paper",10,primary ? nil:"line")
  label(s,x+13,y+11,w-24,22,13,primary ? "paper":"ink","bold")
}
func card(_ x:CGFloat,_ y:CGFloat,_ w:CGFloat,_ h:CGFloat) { box(x,y,w,h,"paper",15,"line") }
func nav(_ active:String) {
  box(0,0,222,H,"rail"); box(221,0,1,H,"line")
  label("Tunes.",27,26,172,49,34,"ink","serif")
  label("A LIVING TUNEBOOK",30,75,170,18,10,"muted","bold")
  var items=[("home","Home","⌂"),("practice","Practice","◴"),("tunes","Tunes","▣"),("lists","Lists","☷"),("social","Social","♧"),("compare","Compare","⇄")]
  if active == "festival" { items.append(("festival","Festival","♫")) }
  for (i,item) in items.enumerated() {
    let y=143+CGFloat(i)*50
    if item.0==active { box(15,y-5,191,43,"tealSoft",11) }
    label(item.2,29,y+3,25,25,21,item.0==active ? "teal":"muted")
    label(item.1,62,y+6,130,25,14,item.0==active ? "teal":"muted","bold")
  }
  rule(28,836,166)
  box(29,851,30,30,"plum",15); label("L",39,855,17,23,14,"paper","bold")
  label("Lachlan",68,849,125,18,12,"ink","bold")
  label("Account & settings",68,867,135,17,10,"muted")
}
func feedback(_ focus:Bool=false) {
  let y:CGFloat=focus ? 755:832
  box(1244,y,168,44,"teal",22)
  label("◌  Help & feedback",1258,y+12,145,20,12,"paper","bold")
}
func start(_ active:String,_ title:String,_ sub:String,_ right:String="") {
  box(0,0,W,H,"canvas"); nav(active)
  label(title,274,33,740,55,42,"ink","serif")
  label(sub,276,91,800,29,15,"muted")
  if !right.isEmpty { button(right,1198,47,193) }
}
func section(_ title:String,_ y:CGFloat,_ x:CGFloat=274,_ more:String="") {
  label(title,x,y,500,37,23,"ink","serif")
  if !more.isEmpty { label(more,1190,y+7,200,25,13,"teal","bold") }
}
func listRow(_ title:String,_ meta:String,_ y:CGFloat,_ x:CGFloat=296,_ w:CGFloat=765,_ state:String="",_ tint:String="soft") {
  label(title,x,y,w-230,27,16,"ink","bold"); label(meta,x,y+27,w-230,22,12,"muted")
  if !state.isEmpty { _=pill(state,x+w-170,y+11,tint,tint=="tealSoft" ? "teal":tint=="mossSoft" ? "moss":tint=="rustSoft" ? "rust":"muted") }
  rule(x,y+59,w)
}
func render(_ name:String,_ draw:()->Void) throws {
  guard let rep=NSBitmapImageRep(bitmapDataPlanes:nil,pixelsWide:Int(W),pixelsHigh:Int(H),bitsPerSample:8,samplesPerPixel:4,hasAlpha:true,isPlanar:false,colorSpaceName:.deviceRGB,bytesPerRow:0,bitsPerPixel:0), let ctx=NSGraphicsContext(bitmapImageRep:rep) else { throw NSError(domain:"bitmap",code:1) }
  NSGraphicsContext.saveGraphicsState(); NSGraphicsContext.current=ctx
  draw(); ctx.flushGraphics(); NSGraphicsContext.restoreGraphicsState()
  guard let data=rep.representation(using:.png,properties:[:]) else { throw NSError(domain:"png",code:1) }
  try data.write(to:out.appendingPathComponent(name+".png"))
}

try render("home") {
  start("home","Good afternoon, Lachlan","Your tunes, ready when you are.")
  box(274,145,1118,230,"tealSoft",20,"line")
  label("READY TO PLAY",306,174,360,18,11,"teal","bold")
  label("Pick up your practice",306,202,670,55,36,"ink","serif")
  label("27 tunes are ready for a review. Start with the one that has waited longest, then stop whenever you’re done.",308,267,630,54,15,"muted")
  button("Continue practice",307,322,188)
  box(1032,181,1,157,"line"); label("27",1066,192,140,82,62,"teal","serif")
  label("ready to review",1068,269,250,24,13,"muted","bold")
  label("Up next: Phillip’s Dog",1068,312,260,23,13,"ink","bold")
  section("Your repertoire",410,274,"Open Tunes →")
  card(274,452,1118,106)
  for (i,(n,t)) in [("109","Known tunes"),("32","In practice"),("172","Saved in lists")].enumerated() {
    let x:CGFloat=303+CGFloat(i)*367
    if i>0 { box(x-21,473,1,64,"line") }
    label(n,x,470,190,47,30,"ink","serif"); label(t,x,514,240,21,12,"muted")
  }
  label("Up next",274,591,300,37,23,"ink","serif")
  label("See all practice →",794,598,185,25,13,"teal","bold")
  label("From your circle",998,591,265,37,23,"ink","serif")
  label("Open Social →",1277,598,113,25,13,"teal","bold")
  card(274,633,702,196); listRow("Phillip’s Dog","Stage 5 · 14-day review · ready since 2 Jul",650,294,659,"Ready","rustSoft")
  listRow("The 28th of January","Stage 6 · 30-day review · ready since 7 Jul",713,294,659,"Ready","rustSoft")
  label("Black Eyed Susie · Saved from Erin’s list",294,779,610,28,13,"muted")
  card(998,633,394,196)
  label("Erin Heycox practised Eighth of January",1018,651,350,40,13,"ink","medium")
  label("30 Aug · Comment · Cheer",1018,685,340,18,11,"muted"); rule(1018,712,352)
  label("Mickey practised Red Haired Boy",1018,728,350,27,13,"ink","medium")
  label("11 Sep · Comment · Cheer",1018,760,340,18,11,"muted")
  feedback()
}

try render("practice") {
  box(0,0,W,H,"canvas")
  label("Tunes.",43,28,260,46,29,"ink","serif")
  label("Practice · Today, 3 Oct 2026",591,42,330,27,14,"muted","medium")
  label("Leave practice",1252,43,165,25,13,"teal","bold")
  label("Ready for review · from earlier days",285,113,600,25,13,"muted")
  card(285,151,870,589)
  _=pill("Stage 5 · 14-day review",324,184,"tealSoft","teal")
  _=pill("Ready since 2 Jul",523,184,"rustSoft","rust")
  label("Phillip’s Dog",324,229,765,77,58,"ink","serif")
  label("Old-Time · Key D · 4/4",326,313,650,25,15,"muted")
  box(325,369,790,178,"tealSoft",14)
  box(688,416,69,69,"teal",35); label("▶",714,433,34,37,25,"paper")
  label("Reference recording · play when you need it",347,511,590,21,12,"muted","medium")
  label("WHAT THIS STAGE MEANS",325,578,380,20,11,"teal","bold")
  label("The 14-day review checks whether the tune stays familiar after two weeks. Solid moves it to 30 days; Shaky repeats 14 days; Rough returns to 3 days.",325,607,480,103,13,"muted")
  label("OPTIONAL NOTE",845,578,260,20,11,"teal","bold")
  box(844,607,268,66,"canvas",9,"line")
  label("What felt easy or difficult?",855,623,245,28,12,"muted")
  label("Play from memory first if you can. Use the reference when you need it.",290,757,750,27,12,"muted")
  box(0,796,W,104,"paper"); rule(0,796,W)
  for (i,(name,desc,tint)) in [("Rough","Revisit in 3 days","rust"),("Shaky","Repeat in 14 days","ochre"),("Solid","Next review in 30 days","moss")].enumerated() {
    let x:CGFloat=282+CGFloat(i)*296; box(x,814,282,65,"paper",11,"line")
    label(name,x+16,826,240,24,16,tint,"bold"); label(desc,x+16,852,240,19,11,"muted")
  }
  feedback(true)
}

try render("tunes") {
  start("tunes","Tunes","Find a tune, hear it, and decide what to do next.","Create tune")
  card(274,149,1118,87)
  box(293,168,758,47,"paper",10,"line"); label("⌕  Search 671 tunes by title",310,181,705,24,14,"muted")
  button("Filters",1062,170,133,false); button("Title A–Z ▾",1204,170,164,false)
  _=pill("All tunes ×",274,255,"soft","muted"); label("671 results",386,262,180,22,12,"muted")
  card(274,302,1118,499)
  label("TUNE",299,323,540,18,11,"muted","bold"); label("MY REPERTOIRE",880,323,260,18,11,"muted","bold"); rule(299,355,1067)
  let tunes=[("1312","Key A Modal · 4/4","Not in repertoire","soft"),("A Fig for a Kiss","Irish · Key E minor · 9/8","Not in repertoire","soft"),("Abe’s Retreat","Old-Time · Key A Modal","Not in repertoire","soft"),("Black Eyed Susie","Old-Time · Key D","In a list","ochreSoft"),("Phillip’s Dog","Old-Time · Key D","In practice","tealSoft"),("Red Haired Boy","Irish · Key A","Known","mossSoft")]
  for (i,t) in tunes.enumerated() {
    let y:CGFloat=369+CGFloat(i)*70
    label(t.0,301,y,500,27,16,"ink","bold"); label(t.1,301,y+28,500,20,12,"muted")
    _=pill(t.2,878,y+12,t.3,t.3=="tealSoft" ? "teal":t.3=="mossSoft" ? "moss":"muted")
    button("Open tune",1241,y+8,121,false)
    if i<5 { rule(299,y+64,1065) }
  }
  label("A tune opens to references, notes and contextual actions. Results stay in small pages.",278,818,1000,28,12,"muted")
  feedback()
}

try render("tune") {
  start("tunes","Abe’s Retreat","Old-Time · Key A Modal · 4/4")
  label("← All tunes",275,136,260,22,13,"teal","bold")
  _=pill("Not in practice",1223,136,"soft","muted")
  rule(274,182,1118)
  label("Info",278,199,120,25,13,"teal","bold"); label("Reference",411,199,130,25,13,"muted","bold")
  box(275,232,42,2,"teal")
  card(274,257,714,185)
  label("At a glance",298,278,390,39,25,"ink","serif")
  label("Old-Time   ·   A Modal   ·   4/4",300,327,520,25,15,"ink","medium")
  label("Source not recorded yet",300,357,450,23,12,"muted")
  rule(299,390,663)
  label("Reference recording available",300,405,410,25,13,"ink","medium")
  label("Open Reference →",792,405,170,24,12,"teal","bold")
  card(274,463,714,172)
  label("Sources & lore",298,484,450,39,25,"ink","serif")
  label("Origins, related tunes, stories and contributor credits belong here.",300,529,632,25,13,"muted")
  label("No source or folklore entries yet.",300,561,600,22,12,"muted")
  label("Add a source or story →",300,601,400,24,13,"teal","bold")
  card(274,655,714,176)
  label("My notes",298,672,450,37,25,"ink","serif")
  box(299,715,664,56,"canvas",10,"line")
  label("Add a private note about how you play this tune…",315,731,615,25,13,"muted")
  button("Save note",832,780,131,false)
  card(1012,257,380,256); label("MY REPERTOIRE",1035,281,320,20,11,"teal","bold")
  label("Ready when you are",1034,312,330,34,23,"ink","serif")
  label("Practise now, add this tune to your review rotation for later, or mark it Known if you can already play it.",1035,359,330,65,13,"muted")
  button("Practise now",1035,418,330); button("Add to practice",1035,468,330,false)
  card(1012,529,380,185); label("IN YOUR LISTS",1035,553,310,18,11,"teal","bold")
  label("Not saved to a list yet",1035,588,315,27,15,"ink","medium")
  label("Lists organise tunes without starting a review schedule.",1035,623,322,45,12,"muted")
  label("Add to a list →",1035,681,300,22,13,"teal","bold")
  feedback()
}

try render("reference") {
  start("tunes","Abe’s Retreat","Old-Time · Key A Modal · 4/4","Practise this tune")
  label("← All tunes",275,136,260,22,13,"teal","bold")
  rule(274,182,1118)
  label("Info",278,199,120,25,13,"muted","bold"); label("Reference",411,199,130,25,13,"teal","bold")
  box(408,232,90,2,"teal")
  card(274,257,742,491)
  box(298,281,694,288,"tealSoft",13)
  box(610,384,69,69,"teal",35); label("▶",636,401,30,35,25,"paper")
  label("Suggested reference recording",318,533,450,23,12,"muted")
  box(304,596,680,7,"line",3); box(304,596,281,7,"teal",3); box(577,591,17,17,"teal",8.5)
  label("1:14 / 3:02",302,634,200,23,12,"muted")
  button("0.75× speed",530,627,125,false); button("Loop a passage",667,627,156,false); button("Other recordings",834,627,154,false)
  card(1038,257,354,325); label("WORK ON A PASSAGE",1062,281,300,18,11,"teal","bold")
  label("Repeat what matters",1061,313,310,42,23,"ink","serif")
  label("Mark a phrase while the recording plays. The loop stays with this tune for your next visit.",1062,362,305,64,13,"muted")
  rule(1061,441,304); label("1   Find the phrase",1062,458,294,26,14,"ink","bold")
  label("2   Mark in and out",1062,495,294,26,14,"ink","bold")
  button("Save passage",1062,530,298,false)
  card(1038,603,354,145); label("OTHER SOURCES",1062,626,300,18,11,"teal","bold")
  label("No other recordings added yet.",1062,660,300,27,13,"muted")
  label("Add a reference →",1062,711,300,22,13,"teal","bold")
  section("My listening note",773); card(274,817,742,62)
  label("The B part feels crooked near the turn…",295,833,682,26,13,"muted")
  feedback()
}

try render("lists") {
  start("lists","Lists","Keep tunes together for sessions, teachers, albums, and ideas.","Create list")
  label("Mine · 16",274,144,125,26,14,"teal","bold"); label("Shared with me · 1",421,144,205,26,14,"muted","bold")
  label("Explore public lists",654,144,215,26,14,"muted","bold"); rule(274,179,1118); box(274,178,84,2,"teal")
  box(274,204,970,44,"paper",10,"line"); label("⌕  Search my lists",294,216,570,23,13,"muted")
  button("Filters",1257,205,135,false); label("16 lists · Newest first",276,271,400,22,12,"muted")
  let cards=[("Brittany Haas — Brittany Haas","15 tunes · Old-Time","Tracklist from the self-titled album.","Public"),("Back to the Earth — Adam Hurt","12 tunes · Old-Time","Tunes from Adam Hurt’s album.","Public"),("Earth Tones — Adam Hurt","12 tunes · Old-Time","Solo gourd banjo repertoire.","Public"),("Friday session","18 tunes · Mixed","Favourites for the next gathering.","Private"),("Tunes to revisit","9 tunes · Mixed","Collected ideas, not a review schedule.","Private"),("Erin’s Tunes to Learn","24 tunes · Old-Time","Shared by Erin Heycox.","Shared")]
  for (i,t) in cards.enumerated() {
    let x:CGFloat=274+CGFloat(i%3)*379; let y:CGFloat=309+CGFloat(i/3)*218
    card(x,y,360,199); label(t.0,x+18,y+18,318,51,20,"ink","serif")
    label(t.1,x+18,y+82,318,22,12,"muted"); label(t.2,x+18,y+108,318,38,12,"muted")
    rule(x+18,y+159,324); _=pill(t.3,x+18,y+166,"soft","muted")
    label("Open list →",x+246,y+170,100,20,12,"teal","bold")
  }
  label("A list organises tunes; saving one never starts their review schedules.",277,769,900,25,12,"muted")
  feedback()
}

try render("list") {
  start("lists","Brittany Haas — Brittany Haas","Public list · 15 tunes · curated by Lachlan")
  label("← My lists",275,135,220,23,13,"teal","bold")
  button("Share",1159,129,102,false); button("Manage list",1272,129,120,false)
  label("Tracklist from Brittany Haas’s self-titled album.",275,180,995,34,16,"muted")
  card(274,243,752,583); section("Playing order",263,299)
  label("15 tunes",924,272,95,23,12,"muted")
  let tracks=[("01","The Blackest Crow","Old-Time"),("02","Candy Girl","Old-Time · Key G · 4/4"),("03","Streak O’Lean, Streak O’Fat","Old-Time"),("04","Ora Lee","Old-Time"),("05","Mississippi Breakdown","Old-Time"),("06","Black Eyed Susie","Old-Time · Key D")]
  for (i,t) in tracks.enumerated() {
    let y:CGFloat=314+CGFloat(i)*80
    label(t.0,299,y+3,47,22,12,"muted","bold")
    label(t.1,352,y,540,25,16,"ink","bold"); label(t.2,352,y+29,450,21,12,"muted")
    label("Open tune →",895,y+17,120,21,12,"teal","bold")
    if i<5 { rule(299,y+68,705) }
  }
  card(1049,243,343,246); label("ABOUT THIS LIST",1073,266,291,18,11,"teal","bold")
  label("A listening and playing guide to the album. Save it for reference or pick individual tunes to practise.",1073,304,290,94,13,"muted")
  label("Saving does not add tunes to Practice.",1073,401,290,40,12,"muted")
  button("Save list",1073,437,294)
  feedback()
}

try render("compare") {
  start("compare","Compare","Find the tunes you can play together.","Compare in person")
  card(274,148,1118,98)
  box(296,173,39,39,"plum",19.5); label("L",310,182,20,25,16,"paper","bold")
  label("You",348,183,115,24,15,"ink","bold"); label("＋",459,181,40,29,21,"muted")
  box(512,173,39,39,"teal",19.5); label("E",526,182,20,25,16,"paper","bold")
  label("Erin Heycox",563,181,240,24,15,"ink","bold")
  label("Connected musician",563,207,250,19,11,"muted")
  button("Change person",1203,176,163,false)
  section("Tunes you both know",282,274,"See all 18 →")
  label("Ready to start a session together.",276,317,620,22,13,"muted")
  label("18",1287,270,100,65,43,"teal","serif")
  card(274,355,716,356)
  listRow("Red Haired Boy","Irish · Key A · 4/4",374,299,664,"Both know","mossSoft")
  listRow("Eighth of January","Old-Time · Key D",443,299,664,"Both know","mossSoft")
  listRow("Black Eyed Susie","Old-Time · Key D",512,299,664,"Both know","mossSoft")
  listRow("Winder Slide","Old-Time · Key G",581,299,664,"Both know","mossSoft")
  card(1012,355,380,208); label("A SESSION STARTING POINT",1036,379,320,18,11,"teal","bold")
  label("Pick a few to play",1035,408,330,42,24,"ink","serif")
  label("Start from shared tunes, adjust the order, then save a private setlist.",1036,456,326,48,13,"muted")
  button("Make a session list",1036,511,327)
  card(1012,580,380,131)
  label("7 tunes both in practice",1035,601,325,25,14,"ink","bold")
  label("12 tunes one of you could teach",1035,646,325,25,14,"ink","bold")
  feedback()
}

try render("social") {
  start("social","Social","Keep up with the musicians you know.","Find friends")
  label("Activity",275,146,120,23,13,"teal","bold")
  label("Friends · 12",407,146,140,23,13,"muted","bold")
  label("Requests · 1",568,146,155,23,13,"muted","bold")
  rule(274,181,1118); box(274,180,70,2,"teal")
  card(274,212,739,464)
  let events=[("E","Erin Heycox practised Eighth of January","30 Aug · Comment · Cheer"),("M","Mickey practised Red Haired Boy","11 Sep · Comment · Cheer"),("H","Hanni shared Session favourites","8 Sep · Open list")]
  for (i,t) in events.enumerated() {
    let y:CGFloat=236+CGFloat(i)*139
    box(300,y,37,37,i==1 ? "teal":"plum",18.5)
    label(t.0,312,y+9,25,22,14,"paper","bold")
    label(t.1,355,y+1,610,48,15,"ink","medium")
    label(t.2,355,y+52,500,21,12,"muted")
    if i<2 { rule(299,y+110,690) }
  }
  card(1034,212,358,464)
  label("YOUR CIRCLE",1058,237,305,18,11,"teal","bold")
  label("Play together",1057,266,300,40,24,"ink","serif")
  for (i,t) in ["Erin Heycox","Hanni","Mickey"].enumerated() {
    let y:CGFloat=330+CGFloat(i)*96
    label(t,1059,y,215,25,15,"ink","bold")
    label("Compare →",1273,y+1,99,24,12,"teal","bold")
    if i<2 { rule(1058,y+70,307) }
  }
  feedback()
}

try render("festival") {
  start("festival","Festival hub","A partner-curated way into tunes and sessions.")
  _=pill("Partner hub · owner enabled",1133,54,"mossSoft","moss")
  box(274,145,1118,166,"mossSoft",19,"line")
  label("A TUNES PARTNER HUB",304,170,450,20,11,"moss","bold")
  label("Partner festival · example",304,202,700,55,33,"ink","serif")
  label("Illustrative layout only. Artists, tunes, sessions and dates appear after a real partnership is approved.",306,262,790,42,13,"muted")
  button("Official programme",1194,244,169,false)
  label("Explore",276,342,112,25,13,"teal","bold")
  label("Sessions by day",412,342,194,25,13,"muted","bold")
  label("About",628,342,90,25,13,"muted","bold")
  rule(274,379,1118); box(274,378,69,2,"teal")
  section("Artist collections",408,274,"See all lists →")
  let tiles=[("OLD-TIME","Artist repertoire","12 tunes · Learn before the gathering."),("IRISH","Session favourites","15 tunes · Suggested repertoire."),("REGIONAL","Tunes to discover","9 tunes · Curated by the partner.")]
  for (i,t) in tiles.enumerated() {
    let x:CGFloat=274+CGFloat(i)*378
    box(x,455,359,160,"mossSoft",13,"line")
    label(t.0,x+18,477,314,19,11,"moss","bold")
    label(t.1,x+18,504,317,35,20,"ink","serif")
    label(t.2,x+18,549,320,28,12,"muted")
    label("Open list →",x+18,584,250,22,12,"teal","bold")
  }
  section("Sessions",648,274,"Full day-by-day schedule →")
  card(274,691,1118,151)
  label("Approved session title and time",300,709,724,25,15,"ink","bold")
  label("Leader and venue supplied by the partner’s official programme",300,736,714,20,12,"muted")
  rule(299,772,1065)
  label("Another approved session",300,790,750,26,15,"ink","bold")
  label("Confirmed details link to the official programme",300,816,680,20,12,"muted")
  feedback()
}

try render("diary") {
  box(0,0,W,H,"canvas")
  box(0,0,222,H,"rail"); box(221,0,1,H,"line")
  label("Practice Diary",27,27,185,45,25,"ink","serif")
  label("← Back to Tunes",29,91,178,25,12,"teal","bold")
  rule(28,134,166)
  label("JOURNAL",28,157,165,19,10,"muted","bold")
  let items=[("Today","◴"),("Week","▥"),("Month","▦"),("Focus areas","◎"),("Tune history","▣")]
  for (i,item) in items.enumerated() {
    let y:CGFloat=195+CGFloat(i)*52
    if i==0 { box(15,y-5,191,43,"tealSoft",11) }
    label(item.1,30,y+3,24,25,18,i==0 ? "teal":"muted")
    label(item.0,62,y+5,133,25,14,i==0 ? "teal":"muted","bold")
  }
  rule(28,836,166)
  label("Private to you",29,851,167,23,12,"muted")
  label("Today’s practice",274,36,754,55,42,"ink","serif")
  label("Saturday 3 October · your record of what happened, not another to-do list.",276,95,850,25,14,"muted")
  button("Add a reflection",1197,47,195)
  card(274,152,1118,94)
  label("3",301,172,90,47,34,"teal","serif"); label("tunes practised",354,185,238,27,14,"ink","bold")
  box(597,173,1,53,"line")
  label("1",626,172,80,47,34,"ink","serif"); label("reflection saved",677,185,220,27,14,"muted")
  box(918,173,1,53,"line")
  label("Focus",949,177,118,30,18,"ink","serif")
  label("Keep the bow light in the B part",1046,186,317,41,13,"muted")
  section("Session notes",278)
  card(274,322,710,417)
  label("Today’s reflection",299,346,410,30,19,"ink","serif")
  label("The first pass felt uncertain, then the tune settled when I slowed down.",300,388,641,52,15,"ink")
  label("PRIVATE NOTE · SAVED AFTER PRACTICE",300,454,570,20,10,"muted","bold")
  rule(299,492,660)
  label("Tunes played",299,519,500,29,19,"ink","serif")
  listRow("Phillip’s Dog","Review · Solid · next review 17 Oct",565,299,660)
  listRow("Black Eyed Susie","Review · Shaky · next review 17 Oct",631,299,660)
  card(1007,322,385,198)
  label("FOCUS AREAS",1031,348,330,20,11,"teal","bold")
  label("Keep one musical intention",1030,378,326,37,21,"ink","serif")
  label("Track what you want to hear or feel next time, without turning it into another quota.",1031,426,323,55,13,"muted")
  label("Open Focus areas →",1031,486,290,23,13,"teal","bold")
  card(1007,539,385,200)
  label("TUNE HISTORY",1031,564,330,20,11,"teal","bold")
  label("Find the last time you played it",1030,595,326,42,20,"ink","serif")
  label("Browse by tune or date inside your Diary.",1031,650,324,39,13,"muted")
  label("Open tune history →",1031,705,300,23,13,"teal","bold")
  feedback()
}

try render("practice_finish") {
  box(0,0,W,H,"canvas")
  label("Tunes.",43,29,240,45,29,"ink","serif")
  label("Practice",680,43,170,24,14,"muted","medium")
  card(359,162,722,555)
  box(669,203,70,70,"mossSoft",35)
  label("✓",690,218,37,40,25,"moss","bold")
  label("Practice saved",485,299,473,68,44,"ink","serif")
  label("Your reviews are recorded. You can leave whenever you’re ready.",453,372,545,43,15,"muted")
  button("Done",583,435,274)
  rule(397,509,646)
  label("Anything you’d like to remember?",473,538,530,37,23,"ink","serif")
  label("Keep a private note about today’s practice.",502,581,480,25,13,"muted")
  button("Open Practice Diary",513,624,207,false)
  label("Not now",766,635,160,25,13,"muted","bold")
  feedback(true)
}

let screens:[(String,()->Void)]=[]
// The renders above are intentionally separate so each PNG is stable and
// can be compared independently during implementation.
print("Rendered 12 page/state mockups to \(out.path)")
