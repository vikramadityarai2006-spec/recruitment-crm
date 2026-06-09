
import { useState, useMemo, useCallback } from "react";
// ─── SEED DATA ───────────────────────────────────────────────────────────────
const INITIAL_MASTERS = {
  clients: ["AP Rubber", "Acme", "Alicon", "Anada Group", "Ananda", "Ananda Balaji", "Arkelite", "Avadh Rail", "BBD", "CEC", "CMR", "Cornish", "Corob", "Dashmesh group", "Elofic Industries", "FIL Industries", "Fratelli Wines", "Gravita", "Gyan Dairy", "Gyandhara", "India Forge", "Instapower", "JSW", "Jageram", "Jindal SAW", "Jyoti Steel", "KM Sugar", "Kanoria", "Kokam ply", "Kokum Ply", "LINUS International", "M-Safe", "Metal Seam", "Mirzapur Electrical", "Modern Insulator", "Modern Metalcast Limited", "NRB Bearing", "Payal Group", "Pocl", "Polyset", "Polytech Synergy", "Prag industries", "Purflux", "QGS", "Raghushree Plast", "SM Auto", "Shailmar", "Skylark Food", "Suapa", "Suspa", "Swellowrap Industries", "TPack Packaging", "Tatsa Innovation", "Teena Group", "Tinna rubber", "Titan Biotech", "Translight Scaff", "Urja Global", "Vansh", "Visaava Industry", "Vista Processed Foods", "Vivo", "Xor technologies", "Zuari", "Zytex", "clivet Aircondisioning system Pvt limited", "prag aeronutics"],
  owners: ["Abhay", "Abhilasha", "Aditya", "Aishwarya", "Akshat", "Ample Leap", "Anjali", "Ankita", "Anshika", "Anushka", "Ayush", "Ayushi", "Chandni", "Geeta", "Harshita", "Karishma", "Manish Sir", "Mansi", "Nivedita", "Pallavi", "Payal", "Prachi", "Pragya", "Puja", "Ragini", "Raksha", "Ruchi", "Sameer Sir", "Sanjay Sir", "Sarojni", "Shashank", "Shivangi", "Shruti", "Shyam+Pallavi", "Sooraj", "Sudhanshu", "Suraj", "Sweety", "Vaisnavi", "Vikas", "Yogita"],
  joiningStatus: ["Offered","Joined","Backout","Left","Rejected","Hold","Cancelled"],
  resignationStatus: ["Pending","Accepted","Done","Rejected","NaN"],
  statusCodes: [
    { code: "Red", label: "Lost Case", color: "#ef4444" },
    { code: "Orange", label: "Offer Given – Joining Pending", color: "#f97316" },
    { code: "Brown", label: "Joined – Invoice Not Raised", color: "#92400e" },
    { code: "Yellow", label: "Invoice Raised – Payment Pending", color: "#eab308" },
    { code: "Green", label: "Payment Received – <6 Months", color: "#22c55e" },
    { code: "Blue", label: "Payment Received – 6 Months Complete", color: "#3b82f6" },
  ],
};

const SEED_CANDIDATES = [
  { id:1,sn:1,client:"Metal Seam",designation:"Manufaturing Head",location:"Lucknow",name:"Ajay kumar",actualDOJ:"8 th Jan",offerMonth:"2024-10-23",phone:"8010410021",resignationAcceptance:"Done",proposedDOJ:"8th Jan",owner:"Manish Sir",joiningStatus:"Joined",ctc:121916,statusCode:"Green",notes:"",createdAt:"2024-10-23",updatedAt:"2024-10-23",deleted:false },
  { id:2,sn:2,client:"Metal Seam",designation:"Internal Auditor",location:"Lucknow",name:"Arpita Singh",actualDOJ:"2024-02-01",offerMonth:"2024-12-23",phone:"9717344700",resignationAcceptance:"Done",proposedDOJ:"2024-02-01",owner:"Nivedita",joiningStatus:"Joined",ctc:45000,statusCode:"Red",notes:"",createdAt:"2024-12-23",updatedAt:"2024-12-23",deleted:false },
  { id:3,sn:3,client:"Vista Processed Foods",designation:"qa officer",location:"Gurgoan",name:"Deependra singh",actualDOJ:"2024-01-15",offerMonth:"2024-01-24",phone:"7905604617",resignationAcceptance:"Done",proposedDOJ:"2024-01-15",owner:"Chandni",joiningStatus:"Joined",ctc:41500,statusCode:"Green",notes:"",createdAt:"2024-01-24",updatedAt:"2024-01-24",deleted:false },
  { id:4,sn:4,client:"Gyandhara",designation:"Account Manager",location:"Lucknow",name:"Ram Singh",actualDOJ:"2024-02-15",offerMonth:"2024-01-24",phone:"7275780030",resignationAcceptance:"Done",proposedDOJ:"2024-02-28",owner:"Yogita",joiningStatus:"Joined",ctc:65166,statusCode:"Green",notes:"",createdAt:"2024-01-24",updatedAt:"2024-01-24",deleted:false },
  { id:5,sn:5,client:"Zytex",designation:"JRA",location:"Mumbai",name:"Shobha Prajapat",actualDOJ:"2024-01-08",offerMonth:"2024-01-24",phone:"9136275030",resignationAcceptance:"Done",proposedDOJ:"2024-01-08",owner:"Ruchi",joiningStatus:"Joined",ctc:15000,statusCode:"Green",notes:"",createdAt:"2024-01-24",updatedAt:"2024-01-24",deleted:false },
  { id:6,sn:6,client:"Alicon",designation:"Automation Engineer",location:"pune",name:"Sagar Tandale",actualDOJ:"2024-02-08",offerMonth:"2024-01-24",phone:"9923286079",resignationAcceptance:"Done",proposedDOJ:"2024-02-08",owner:"Mansi",joiningStatus:"Joined",ctc:62500,statusCode:"Green",notes:"",createdAt:"2024-01-24",updatedAt:"2024-01-24",deleted:false },
  { id:7,sn:7,client:"Zytex",designation:"Sales coordinator",location:"Mumbai",name:"Vibha",actualDOJ:"2024-02-12",offerMonth:"2024-01-24",phone:"9819748017",resignationAcceptance:"Done",proposedDOJ:"2024-02-12",owner:"Nivedita",joiningStatus:"Joined",ctc:41666,statusCode:"Green",notes:"",createdAt:"2024-01-24",updatedAt:"2024-01-24",deleted:false },
  { id:8,sn:8,client:"Metal Seam",designation:"GM Maintenance",location:"Lucknow",name:"Shailendra Mishra",actualDOJ:"2024-02-01",offerMonth:"2024-01-24",phone:"9811959434",resignationAcceptance:"Done",proposedDOJ:"2024-02-01",owner:"Manish Sir",joiningStatus:"Joined",ctc:160836,statusCode:"Green",notes:"",createdAt:"2024-01-24",updatedAt:"2024-01-24",deleted:false },
  { id:9,sn:9,client:"Kanoria",designation:"Sales manager",location:"kolkata",name:"Godfray",actualDOJ:"2024-02-01",offerMonth:"2024-01-24",phone:"9836831120",resignationAcceptance:"Done",proposedDOJ:"2024-02-01",owner:"Yogita",joiningStatus:"Joined",ctc:82666,statusCode:"Green",notes:"",createdAt:"2024-01-24",updatedAt:"2024-01-24",deleted:false },
  { id:10,sn:10,client:"Gyandhara",designation:"Admin Executive",location:"Lucknow",name:"Kamal kant",actualDOJ:"2024-01-29",offerMonth:"2024-01-24",phone:"8630380020",resignationAcceptance:"Done",proposedDOJ:"2024-01-29",owner:"Chandni",joiningStatus:"Joined",ctc:25000,statusCode:"Green",notes:"",createdAt:"2024-01-24",updatedAt:"2024-01-24",deleted:false },
  { id:11,sn:11,client:"Avadh Rail",designation:"Track design executive",location:"Lucknow",name:"Shahab Alam",actualDOJ:"",offerMonth:"2024-01-24",phone:"8318206354",resignationAcceptance:"",proposedDOJ:"",owner:"Nivedita",joiningStatus:"Offered",ctc:75000,statusCode:"Red",notes:"",createdAt:"2024-01-24",updatedAt:"2024-01-24",deleted:false },
  { id:12,sn:12,client:"Cornish",designation:"Sales Manager",location:"Delhi",name:"Raghuvansh",actualDOJ:"2024-01-24",offerMonth:"2024-01-24",phone:"9654799216",resignationAcceptance:"",proposedDOJ:"2024-01-24",owner:"Pragya",joiningStatus:"Joined",ctc:55555,statusCode:"Red",notes:"",createdAt:"2024-01-24",updatedAt:"2024-01-24",deleted:false },
  { id:13,sn:13,client:"CEC",designation:"Sales Pramoter",location:"Punjab",name:"Vishal",actualDOJ:"2024-02-01",offerMonth:"2024-01-24",phone:"",resignationAcceptance:"Done",proposedDOJ:"2024-01-29",owner:"Yogita",joiningStatus:"Joined",ctc:35911,statusCode:"Green",notes:"",createdAt:"2024-01-24",updatedAt:"2024-01-24",deleted:false },
  { id:14,sn:14,client:"Payal Group",designation:"Capex Head",location:"Delhi",name:"Gaurav Sharma",actualDOJ:"2024-02-12",offerMonth:"2024-01-24",phone:"7073930744",resignationAcceptance:"Done",proposedDOJ:"2024-02-12",owner:"Payal",joiningStatus:"Joined",ctc:241666,statusCode:"Green",notes:"",createdAt:"2024-01-24",updatedAt:"2024-01-24",deleted:false },
  { id:15,sn:15,client:"Metal Seam",designation:"Puchase executive",location:"Lucknow",name:"Sandeep Pandey",actualDOJ:"",offerMonth:"2024-01-24",phone:"9935706131",resignationAcceptance:"",proposedDOJ:"2024-03-16",owner:"Sooraj",joiningStatus:"Offered",ctc:29416,statusCode:"Red",notes:"",createdAt:"2024-01-24",updatedAt:"2024-01-24",deleted:false },
  { id:16,sn:16,client:"Metal Seam",designation:"AM -quality",location:"Lucknow",name:"Mukesh Panday",actualDOJ:"2024-03-01",offerMonth:"2024-01-24",phone:"8130825753",resignationAcceptance:"Done",proposedDOJ:"2024-03-01",owner:"Sooraj",joiningStatus:"Joined",ctc:55555,statusCode:"Green",notes:"",createdAt:"2024-01-24",updatedAt:"2024-01-24",deleted:false },
  { id:17,sn:17,client:"Translight Scaff",designation:"Asst Sales Manager",location:"Noida",name:"Mausham Jha",actualDOJ:"",offerMonth:"2024-01-24",phone:"",resignationAcceptance:"",proposedDOJ:"2024-02-17",owner:"Ragini",joiningStatus:"Offered",ctc:45000,statusCode:"Red",notes:"",createdAt:"2024-01-24",updatedAt:"2024-01-24",deleted:false },
  { id:18,sn:18,client:"Skylark Food",designation:"Quality Head",location:"Sonipat",name:"Tana sabane",actualDOJ:"2024-02-12",offerMonth:"2024-02-24",phone:"9833753758",resignationAcceptance:"Done",proposedDOJ:"2024-02-12",owner:"Chandni",joiningStatus:"Joined",ctc:172500,statusCode:"Green",notes:"",createdAt:"2024-02-24",updatedAt:"2024-02-24",deleted:false },
  { id:19,sn:19,client:"Skylark Food",designation:"GM NPD",location:"Sonipat",name:"Amit Borade",actualDOJ:"2024-03-11",offerMonth:"2024-02-24",phone:"9113874404",resignationAcceptance:"Done",proposedDOJ:"2024-03-11",owner:"Chandni",joiningStatus:"Joined",ctc:171000,statusCode:"Red",notes:"",createdAt:"2024-02-24",updatedAt:"2024-02-24",deleted:false },
  { id:20,sn:20,client:"FIL Industries",designation:"Farm manager",location:"shopian",name:"Javeed Lone",actualDOJ:"2024-03-12",offerMonth:"2024-02-24",phone:"7006575190",resignationAcceptance:"Done",proposedDOJ:"2024-03-12",owner:"Yogita",joiningStatus:"Joined",ctc:95000,statusCode:"Green",notes:"",createdAt:"2024-02-24",updatedAt:"2024-02-24",deleted:false },
  { id:21,sn:21,client:"Metal Seam",designation:"Production Manager",location:"Lucknow",name:"Anil Kumar",actualDOJ:"2024-02-19",offerMonth:"2024-02-24",phone:"",resignationAcceptance:"Done",proposedDOJ:"2024-02-19",owner:"Manish Sir",joiningStatus:"Joined",ctc:55500,statusCode:"Red",notes:"",createdAt:"2024-02-24",updatedAt:"2024-02-24",deleted:false },
  { id:22,sn:22,client:"Metal Seam",designation:"Account executive",location:"Lucknow",name:"Anand",actualDOJ:"2024-03-01",offerMonth:"2024-02-24",phone:"9695712902",resignationAcceptance:"Done",proposedDOJ:"1 st March",owner:"Yogita",joiningStatus:"Joined",ctc:29000,statusCode:"Green",notes:"",createdAt:"2024-02-24",updatedAt:"2024-02-24",deleted:false },
  { id:23,sn:23,client:"SM Auto",designation:"jr. Design Engineer",location:"pune chakan",name:"Anil hanumant",actualDOJ:"2024-03-04",offerMonth:"2024-02-24",phone:"9284988285",resignationAcceptance:"Done",proposedDOJ:"1st March",owner:"Shivangi",joiningStatus:"Joined",ctc:32000,statusCode:"Green",notes:"",createdAt:"2024-02-24",updatedAt:"2024-02-24",deleted:false },
  { id:24,sn:24,client:"Alicon",designation:"HR Executive",location:"Pune",name:"Sharon",actualDOJ:"2024-02-22",offerMonth:"2024-02-24",phone:"9421438737",resignationAcceptance:"Done",proposedDOJ:"2024-02-22",owner:"Mansi",joiningStatus:"Joined",ctc:46600,statusCode:"Green",notes:"",createdAt:"2024-02-24",updatedAt:"2024-02-24",deleted:false },
  { id:25,sn:25,client:"Swellowrap Industries",designation:"Production Manager",location:"Gujarat",name:"Shambhu San",actualDOJ:"2024-03-02",offerMonth:"2024-02-24",phone:"9712425066",resignationAcceptance:"Done",proposedDOJ:"2024-03-02",owner:"Chandni",joiningStatus:"Joined",ctc:106300,statusCode:"Green",notes:"",createdAt:"2024-02-24",updatedAt:"2024-02-24",deleted:false },
  { id:26,sn:26,client:"Arkelite",designation:"Route Head",location:"Lucknow",name:"Umesh",actualDOJ:"",offerMonth:"2024-02-24",phone:"9793099886",resignationAcceptance:"",proposedDOJ:"2024-05-06",owner:"Raksha",joiningStatus:"Offered",ctc:125000,statusCode:"Red",notes:"",createdAt:"2024-02-24",updatedAt:"2024-02-24",deleted:false },
  { id:27,sn:27,client:"Vista Processed Foods",designation:"Dispatch Officer",location:"Sirhind",name:"Manoj Kumar",actualDOJ:"2024-03-19",offerMonth:"2024-02-24",phone:"",resignationAcceptance:"Done",proposedDOJ:"2024-03-20",owner:"Sanjay Sir",joiningStatus:"Joined",ctc:35000,statusCode:"Green",notes:"",createdAt:"2024-02-24",updatedAt:"2024-02-24",deleted:false },
  { id:28,sn:28,client:"SM Auto",designation:"supervisor Quality",location:"Pimpri",name:"Sagar tilekar",actualDOJ:"2024-03-05",offerMonth:"2024-02-24",phone:"7057654829",resignationAcceptance:"Done",proposedDOJ:"2024-03-05",owner:"Ankita",joiningStatus:"Joined",ctc:30000,statusCode:"Green",notes:"",createdAt:"2024-02-24",updatedAt:"2024-02-24",deleted:false },
  { id:29,sn:29,client:"Zytex",designation:"jr. Lab Analysist",location:"Mumbai",name:"Harshali",actualDOJ:"2024-02-06",offerMonth:"2024-02-24",phone:"8422040677",resignationAcceptance:"",proposedDOJ:"2024-02-06",owner:"Yogita",joiningStatus:"Joined",ctc:13000,statusCode:"Red",notes:"",createdAt:"2024-02-24",updatedAt:"2024-02-24",deleted:false },
  { id:30,sn:30,client:"Arkelite",designation:"Sr. sales executive",location:"Lucknow",name:"Avilash",actualDOJ:"2024-03-05",offerMonth:"2024-02-24",phone:"7000271104",resignationAcceptance:"Done",proposedDOJ:"2024-03-05",owner:"Raksha",joiningStatus:"Joined",ctc:40000,statusCode:"Green",notes:"",createdAt:"2024-02-24",updatedAt:"2024-02-24",deleted:false },
  { id:31,sn:31,client:"Alicon",designation:"GM- finance",location:"Pune",name:"Anurag jain",actualDOJ:"2024-05-20",offerMonth:"2024-03-24",phone:"9770909907",resignationAcceptance:"Done",proposedDOJ:"2024-05-20",owner:"Pragya",joiningStatus:"Joined",ctc:266667,statusCode:"Green",notes:"",createdAt:"2024-03-24",updatedAt:"2024-03-24",deleted:false },
  { id:32,sn:32,client:"Corob",designation:"inventory Analysist",location:"Bhilad",name:"Amit Patel",actualDOJ:"1st April",offerMonth:"2024-03-24",phone:"9574481304",resignationAcceptance:"Done",proposedDOJ:"1 st April",owner:"Sudhanshu",joiningStatus:"Joined",ctc:54583,statusCode:"Green",notes:"",createdAt:"2024-03-24",updatedAt:"2024-03-24",deleted:false },
  { id:33,sn:33,client:"FIL Industries",designation:"AM- IT",location:"Delhi",name:"Rajeev Kumar",actualDOJ:"",offerMonth:"2024-03-24",phone:"9463867822",resignationAcceptance:"",proposedDOJ:"2024-04-18",owner:"Sudhanshu",joiningStatus:"Offered",ctc:120834,statusCode:"Red",notes:"",createdAt:"2024-03-24",updatedAt:"2024-03-24",deleted:false },
  { id:34,sn:34,client:"Arkelite",designation:"ASM",location:"Meerut",name:"Anil",actualDOJ:"2024-06-15",offerMonth:"2024-03-24",phone:"9536226899",resignationAcceptance:"",proposedDOJ:"2024-06-15",owner:"Raksha",joiningStatus:"Joined",ctc:100000,statusCode:"Green",notes:"",createdAt:"2024-03-24",updatedAt:"2024-03-24",deleted:false },
  { id:35,sn:35,client:"Alicon",designation:"Store Exceutive",location:"Pune (ACS)",name:"Roshan",actualDOJ:"2024-04-23",offerMonth:"2024-03-24",phone:"9011662418",resignationAcceptance:"Done",proposedDOJ:"2024-04-23",owner:"Aishwarya",joiningStatus:"Joined",ctc:37000,statusCode:"Green",notes:"",createdAt:"2024-03-24",updatedAt:"2024-03-24",deleted:false },
  { id:36,sn:36,client:"KM Sugar",designation:"Account",location:"Faizabad",name:"Amit",actualDOJ:"1 st april",offerMonth:"2024-03-24",phone:"8299567821",resignationAcceptance:"Done",proposedDOJ:"2024-04-01",owner:"Shivangi",joiningStatus:"Joined",ctc:35000,statusCode:"Green",notes:"",createdAt:"2024-03-24",updatedAt:"2024-03-24",deleted:false },
  { id:37,sn:37,client:"SM Auto",designation:"Plant head",location:"Pithampur",name:"Manish Borado",actualDOJ:"2024-03-27",offerMonth:"2024-03-24",phone:"9098040863",resignationAcceptance:"Done",proposedDOJ:"2024-03-27",owner:"Chandni",joiningStatus:"Joined",ctc:133333,statusCode:"Green",notes:"",createdAt:"2024-03-24",updatedAt:"2024-03-24",deleted:false },
  { id:38,sn:38,client:"Polyset",designation:"Sales officer",location:"Lucknow",name:"Abhishek Srivastava",actualDOJ:"",offerMonth:"2024-03-24",phone:"9125000488",resignationAcceptance:"",proposedDOJ:"2024-04-02",owner:"Ragini",joiningStatus:"Offered",ctc:230000,statusCode:"Red",notes:"",createdAt:"2024-03-24",updatedAt:"2024-03-24",deleted:false },
  { id:39,sn:39,client:"Alicon",designation:"Assistant manager store",location:"Chinchwad",name:"Dattatray pandurang jadhav",actualDOJ:"2024-05-14",offerMonth:"2024-03-24",phone:"8788930973",resignationAcceptance:"Done",proposedDOJ:"2024-05-14",owner:"Aishwarya",joiningStatus:"Joined",ctc:67000,statusCode:"Green",notes:"",createdAt:"2024-03-24",updatedAt:"2024-03-24",deleted:false },
  { id:40,sn:40,client:"Jindal SAW",designation:"Design engineer",location:"Solapur",name:"Kishore",actualDOJ:"",offerMonth:"2024-03-24",phone:"9011161851",resignationAcceptance:"",proposedDOJ:"2024-04-01",owner:"Raksha",joiningStatus:"Offered",ctc:41667,statusCode:"Red",notes:"",createdAt:"2024-03-24",updatedAt:"2024-03-24",deleted:false },
  { id:41,sn:41,client:"SM Auto",designation:"Sr Engineer NPD",location:"Pimpri",name:"Akshay Darkunde",actualDOJ:"2024-05-02",offerMonth:"2024-03-24",phone:"7709072269",resignationAcceptance:"Done",proposedDOJ:"1stMay",owner:"Shivangi",joiningStatus:"Joined",ctc:48000,statusCode:"Green",notes:"",createdAt:"2024-03-24",updatedAt:"2024-03-24",deleted:false },
  { id:42,sn:42,client:"FIL Industries",designation:"HR Recruiter",location:"Delhi",name:"Akshay",actualDOJ:"2024-04-08",offerMonth:"2024-03-24",phone:"9899615931",resignationAcceptance:"Done",proposedDOJ:"2024-04-06",owner:"Raksha",joiningStatus:"Joined",ctc:46000,statusCode:"Green",notes:"",createdAt:"2024-03-24",updatedAt:"2024-03-24",deleted:false },
  { id:43,sn:43,client:"Modern Insulator",designation:"HR Executive",location:"Sanand",name:"Mayur",actualDOJ:"2024-05-01",offerMonth:"2024-03-24",phone:"8140558561",resignationAcceptance:"Done",proposedDOJ:"2024-04-25",owner:"Chandni",joiningStatus:"Joined",ctc:25000,statusCode:"Green",notes:"",createdAt:"2024-03-24",updatedAt:"2024-03-24",deleted:false },
  { id:44,sn:44,client:"Vista Processed Foods",designation:"AM Maintaience",location:"Sirhind",name:"Tirpesh",actualDOJ:"2024-04-15",offerMonth:"2024-03-24",phone:"9958779457",resignationAcceptance:"Done",proposedDOJ:"2024-04-15",owner:"Chandni",joiningStatus:"Joined",ctc:66666,statusCode:"Red",notes:"",createdAt:"2024-03-24",updatedAt:"2024-03-24",deleted:false },
  { id:45,sn:45,client:"SM Auto",designation:"Quality Manager",location:"Shriperumbudur",name:"R.balasubramani",actualDOJ:"2024-04-27",offerMonth:"2024-03-24",phone:"",resignationAcceptance:"Done",proposedDOJ:"2nd May",owner:"Ankita",joiningStatus:"Joined",ctc:76666,statusCode:"Red",notes:"",createdAt:"2024-03-24",updatedAt:"2024-03-24",deleted:false },
  { id:46,sn:46,client:"Zytex",designation:"Jr.lab Analysist",location:"Mumbai",name:"Darpana",actualDOJ:"1st April",offerMonth:"2024-03-24",phone:"9987292637",resignationAcceptance:"Done",proposedDOJ:"1st April",owner:"Aishwarya",joiningStatus:"Joined",ctc:15000,statusCode:"Green",notes:"",createdAt:"2024-03-24",updatedAt:"2024-03-24",deleted:false },
  { id:47,sn:47,client:"Alicon",designation:"Sales Manager",location:"Binola",name:"yoginder Singh",actualDOJ:"2024-05-10",offerMonth:"2024-03-24",phone:"9910466577",resignationAcceptance:"Done",proposedDOJ:"2024-05-10",owner:"Yogita",joiningStatus:"Joined",ctc:183333,statusCode:"Green",notes:"",createdAt:"2024-03-24",updatedAt:"2024-03-24",deleted:false },
  { id:48,sn:48,client:"Vista Processed Foods",designation:"Store executive",location:"Sirhind",name:"Tujendra Singh",actualDOJ:"2024-04-26",offerMonth:"2024-03-24",phone:"9805073004",resignationAcceptance:"Done",proposedDOJ:"2024-04-15",owner:"Sanjay Sir",joiningStatus:"Joined",ctc:30000,statusCode:"Green",notes:"",createdAt:"2024-03-24",updatedAt:"2024-03-24",deleted:false },
  { id:49,sn:49,client:"Metal Seam",designation:"PPC executive",location:"Lucknow",name:"Alok Dwiwedi",actualDOJ:"",offerMonth:"2024-03-24",phone:"9057511799",resignationAcceptance:"",proposedDOJ:"2024-05-02",owner:"Suraj",joiningStatus:"Offered",ctc:32000,statusCode:"Red",notes:"",createdAt:"2024-03-24",updatedAt:"2024-03-24",deleted:false },
  { id:50,sn:50,client:"Modern Insulator",designation:"Accounts",location:"worli Mumbai",name:"Ganesh",actualDOJ:"1-st April",offerMonth:"2024-03-24",phone:"9320774620",resignationAcceptance:"Done",proposedDOJ:"1 st april",owner:"Ample Leap",joiningStatus:"Joined",ctc:55416,statusCode:"Green",notes:"",createdAt:"2024-03-24",updatedAt:"2024-03-24",deleted:false },
  { id:51,sn:51,client:"Metal Seam",designation:"AM - quality",location:"Lucknow",name:"Kesav Sharma",actualDOJ:"",offerMonth:"2024-03-24",phone:"8299870902",resignationAcceptance:"",proposedDOJ:"29 th April",owner:"Chandni",joiningStatus:"Offered",ctc:60000,statusCode:"Red",notes:"",createdAt:"2024-03-24",updatedAt:"2024-03-24",deleted:false },
  { id:52,sn:52,client:"Metal Seam",designation:"AM - QC",location:"Lucknow",name:"Anurag verma",actualDOJ:"",offerMonth:"2024-03-24",phone:"",resignationAcceptance:"Done",proposedDOJ:"30 th April",owner:"Nivedita",joiningStatus:"Offered",ctc:55000,statusCode:"Red",notes:"",createdAt:"2024-03-24",updatedAt:"2024-03-24",deleted:false },
  { id:53,sn:53,client:"SM Auto",designation:"quality engineer - CMM",location:"Hosur",name:"M. kartikeyan",actualDOJ:"14 th May",offerMonth:"2024-04-24",phone:"8883830533",resignationAcceptance:"Done",proposedDOJ:"13 st may",owner:"Sanjay Sir",joiningStatus:"Joined",ctc:30000,statusCode:"Red",notes:"",createdAt:"2024-04-24",updatedAt:"2024-04-24",deleted:false },
  { id:54,sn:54,client:"Alicon",designation:"core Shop supervisor",location:"Chinchwad",name:"Gajanan",actualDOJ:"2024-05-20",offerMonth:"2024-04-24",phone:"",resignationAcceptance:"",proposedDOJ:"2024-05-20",owner:"Yogita",joiningStatus:"Backout",ctc:44444,statusCode:"Red",notes:"",createdAt:"2024-04-24",updatedAt:"2024-04-24",deleted:false },
  { id:55,sn:55,client:"Alicon",designation:"Safty officer",location:"Chinchwad",name:"Sudam Pawar",actualDOJ:"",offerMonth:"2024-04-24",phone:"9423412504",resignationAcceptance:"",proposedDOJ:"3 rd june",owner:"Ankita",joiningStatus:"Offered",ctc:80000,statusCode:"Red",notes:"",createdAt:"2024-04-24",updatedAt:"2024-04-24",deleted:false },
  { id:56,sn:56,client:"Arkelite",designation:"ASM",location:"Raipur",name:"Ramkumar Shahu",actualDOJ:"25 th April",offerMonth:"2024-04-24",phone:"9303171318",resignationAcceptance:"Done",proposedDOJ:"25th April",owner:"Aishwarya",joiningStatus:"Joined",ctc:40000,statusCode:"Red",notes:"",createdAt:"2024-04-24",updatedAt:"2024-04-24",deleted:false },
  { id:57,sn:57,client:"Corob",designation:"Engg R&D",location:"Bhilad",name:"Rishikesh Pal",actualDOJ:"2024-06-03",offerMonth:"2024-04-24",phone:"9662903348",resignationAcceptance:"Done",proposedDOJ:"3rd june",owner:"Ample Leap",joiningStatus:"Joined",ctc:50000,statusCode:"Green",notes:"",createdAt:"2024-04-24",updatedAt:"2024-04-24",deleted:false },
  { id:58,sn:58,client:"Corob",designation:"cost Accountant",location:"Bhilad",name:"Mitesh Trivedi",actualDOJ:"17 th May",offerMonth:"2024-04-24",phone:"9687413569",resignationAcceptance:"Done",proposedDOJ:"2024-05-17",owner:"Sanjay Sir",joiningStatus:"Joined",ctc:150000,statusCode:"Green",notes:"",createdAt:"2024-04-24",updatedAt:"2024-04-24",deleted:false },
  { id:59,sn:59,client:"Metal Seam",designation:"Purchase Executive",location:"Lucknow",name:"Divyanshu Singh",actualDOJ:"19 th April",offerMonth:"2024-04-24",phone:"9616384467",resignationAcceptance:"Done",proposedDOJ:"19 th Apil",owner:"Sooraj",joiningStatus:"Joined",ctc:30000,statusCode:"Red",notes:"",createdAt:"2024-04-24",updatedAt:"2024-04-24",deleted:false },
  { id:60,sn:60,client:"Metal Seam",designation:"Sr.Manager Hr",location:"Lucknow",name:"RN pandey",actualDOJ:"2024-04-28",offerMonth:"2024-04-24",phone:"8053772680",resignationAcceptance:"Done",proposedDOJ:"2024-04-25",owner:"Raksha",joiningStatus:"Joined",ctc:85555,statusCode:"Red",notes:"",createdAt:"2024-04-24",updatedAt:"2024-04-24",deleted:false },
  { id:61,sn:61,client:"Metal Seam",designation:"AM - QC",location:"Lucknow",name:"Dev krishna",actualDOJ:"2024-05-30",offerMonth:"2024-04-24",phone:"7859818892",resignationAcceptance:"Done",proposedDOJ:"2024-05-30",owner:"Nivedita",joiningStatus:"Joined",ctc:70850,statusCode:"Green",notes:"",createdAt:"2024-04-24",updatedAt:"2024-04-24",deleted:false },
  { id:62,sn:62,client:"Polyset",designation:"Sales officer",location:"Nasik",name:"Tushar M. Raoandore",actualDOJ:"2 nd May",offerMonth:"2024-04-24",phone:"9881152372",resignationAcceptance:"Done",proposedDOJ:"2 nd May",owner:"Ragini",joiningStatus:"Joined",ctc:30000,statusCode:"Green",notes:"",createdAt:"2024-04-24",updatedAt:"2024-04-24",deleted:false },
  { id:63,sn:63,client:"SM Auto",designation:"AM Quality",location:"Pitampur",name:"Dharmendra",actualDOJ:"2024-05-27",offerMonth:"2024-04-24",phone:"8319892516",resignationAcceptance:"Done",proposedDOJ:"27th May",owner:"Aishwarya",joiningStatus:"Joined",ctc:66666,statusCode:"Green",notes:"",createdAt:"2024-04-24",updatedAt:"2024-04-24",deleted:false },
  { id:64,sn:64,client:"SM Auto",designation:"DM Assembly",location:"Pune chakan",name:"Kokane vinod babaji",actualDOJ:"",offerMonth:"2024-04-24",phone:"9657282654",resignationAcceptance:"",proposedDOJ:"2024-06-10",owner:"Aishwarya",joiningStatus:"Offered",ctc:75000,statusCode:"Red",notes:"",createdAt:"2024-04-24",updatedAt:"2024-04-24",deleted:false },
  { id:65,sn:65,client:"SM Auto",designation:"Assitant manager Store",location:"Hosour",name:"T.G . senthil",actualDOJ:"2024-05-09",offerMonth:"2024-04-24",phone:"7418087051",resignationAcceptance:"Done",proposedDOJ:"2024-05-09",owner:"Yogita",joiningStatus:"Joined",ctc:54000,statusCode:"Red",notes:"",createdAt:"2024-04-24",updatedAt:"2024-04-24",deleted:false },
  { id:66,sn:66,client:"Vista Processed Foods",designation:"Store executive",location:"Sirhind",name:"Satish",actualDOJ:"",offerMonth:"2024-04-24",phone:"7411653402",resignationAcceptance:"",proposedDOJ:"2024-05-25",owner:"Chandni",joiningStatus:"Backout",ctc:34584,statusCode:"Red",notes:"",createdAt:"2024-04-24",updatedAt:"2024-04-24",deleted:false },
  { id:67,sn:67,client:"SM Auto",designation:"Store officer",location:"Hosur",name:"Balakrishna Y",actualDOJ:"17th June",offerMonth:"2024-05-24",phone:"9003687693",resignationAcceptance:"Done",proposedDOJ:"17th June",owner:"Ample Leap",joiningStatus:"Joined",ctc:32000,statusCode:"Green",notes:"",createdAt:"2024-05-24",updatedAt:"2024-05-24",deleted:false },
  { id:68,sn:68,client:"Skylark Food",designation:"Quality Head",location:"Panipat",name:"Porender thakur",actualDOJ:"2024-06-17",offerMonth:"2024-05-24",phone:"7986442787",resignationAcceptance:"Done",proposedDOJ:"2024-06-17",owner:"Chandni",joiningStatus:"Joined",ctc:108000,statusCode:"Green",notes:"",createdAt:"2024-05-24",updatedAt:"2024-05-24",deleted:false },
  { id:69,sn:69,client:"Zytex",designation:"Brewing manager",location:"Banglore",name:"Tejsavi",actualDOJ:"",offerMonth:"2024-05-24",phone:"9980095567",resignationAcceptance:"",proposedDOJ:"2024-06-24",owner:"Yogita",joiningStatus:"Backout",ctc:1000000,statusCode:"Red",notes:"",createdAt:"2024-05-24",updatedAt:"2024-05-24",deleted:false },
  { id:70,sn:70,client:"Metal Seam",designation:"Design Engineering",location:"Lucknow",name:"Dharam Veer",actualDOJ:"7 th June",offerMonth:"2024-05-24",phone:"8188804800",resignationAcceptance:"Done",proposedDOJ:"2024-06-07",owner:"Nivedita",joiningStatus:"Joined",ctc:45000,statusCode:"Green",notes:"",createdAt:"2024-05-24",updatedAt:"2024-05-24",deleted:false },
  { id:71,sn:71,client:"Acme",designation:"Plant head",location:"Sonipat",name:"Yatinder",actualDOJ:"2024-06-07",offerMonth:"2024-05-24",phone:"7709449566",resignationAcceptance:"Done",proposedDOJ:"2024-06-10",owner:"Chandni",joiningStatus:"Joined",ctc:83000,statusCode:"Green",notes:"",createdAt:"2024-05-24",updatedAt:"2024-05-24",deleted:false },
  { id:72,sn:72,client:"Zytex",designation:"Ju. Lab Analyst",location:"Mumbai",name:"Anchal Tiwari",actualDOJ:"2024-05-20",offerMonth:"2024-05-24",phone:"7715855788",resignationAcceptance:"Done",proposedDOJ:"2024-05-20",owner:"Aishwarya",joiningStatus:"Joined",ctc:15000,statusCode:"Green",notes:"",createdAt:"2024-05-24",updatedAt:"2024-05-24",deleted:false },
  { id:73,sn:73,client:"Vista Processed Foods",designation:"Account officer",location:"Mumbai",name:"Sahil Mondol",actualDOJ:"2024-06-17",offerMonth:"2024-05-24",phone:"6297418812",resignationAcceptance:"",proposedDOJ:"2024-06-17",owner:"Sanjay Sir",joiningStatus:"Joined",ctc:30000,statusCode:"Green",notes:"",createdAt:"2024-05-24",updatedAt:"2024-05-24",deleted:false },
  { id:74,sn:74,client:"Corob",designation:"Production Engineer",location:"Bhilad",name:"Harshal Surti",actualDOJ:"2024-06-10",offerMonth:"2024-05-24",phone:"9558183410",resignationAcceptance:"Done",proposedDOJ:"2024-06-10",owner:"Chandni",joiningStatus:"Joined",ctc:40000,statusCode:"Green",notes:"",createdAt:"2024-05-24",updatedAt:"2024-05-24",deleted:false },
  { id:75,sn:75,client:"Metal Seam",designation:"EA to MD",location:"Lucknow",name:"Swapnil Kaur Asthana",actualDOJ:"2024-07-05",offerMonth:"2024-05-24",phone:"8874697218",resignationAcceptance:"Done",proposedDOJ:"2024-07-05",owner:"Geeta",joiningStatus:"Joined",ctc:20000,statusCode:"Green",notes:"",createdAt:"2024-05-24",updatedAt:"2024-05-24",deleted:false },
  { id:76,sn:76,client:"Instapower",designation:"BD",location:"Delhi",name:"Raghav",actualDOJ:"",offerMonth:"2024-05-24",phone:"7503489824",resignationAcceptance:"",proposedDOJ:"2024-06-15",owner:"Pragya",joiningStatus:"Backout",ctc:43000,statusCode:"Red",notes:"",createdAt:"2024-05-24",updatedAt:"2024-05-24",deleted:false },
  { id:77,sn:77,client:"Instapower",designation:"BD",location:"Delhi",name:"Jitendra Kumar",actualDOJ:"2024-06-14",offerMonth:"2024-05-24",phone:"8700558081",resignationAcceptance:"Done",proposedDOJ:"2024-06-15",owner:"Pragya",joiningStatus:"Joined",ctc:55000,statusCode:"Red",notes:"",createdAt:"2024-05-24",updatedAt:"2024-05-24",deleted:false },
  { id:78,sn:78,client:"Instapower",designation:"HR",location:"Delhi",name:"Eti Singh",actualDOJ:"2024-05-11",offerMonth:"2024-05-24",phone:"8449521749",resignationAcceptance:"Done",proposedDOJ:"2024-05-11",owner:"Pragya",joiningStatus:"Backout",ctc:32000,statusCode:"Red",notes:"",createdAt:"2024-05-24",updatedAt:"2024-05-24",deleted:false },
  { id:79,sn:79,client:"Alicon",designation:"AM HR",location:"Pune",name:"Rahul Kumar",actualDOJ:"2024-06-27",offerMonth:"2024-06-24",phone:"9970747268",resignationAcceptance:"Done",proposedDOJ:"2024-06-27",owner:"Pallavi",joiningStatus:"Joined",ctc:70000,statusCode:"Green",notes:"",createdAt:"2024-06-24",updatedAt:"2024-06-24",deleted:false },
  { id:80,sn:80,client:"Fratelli Wines",designation:"Deputy Manager HR",location:"Delhi",name:"Satyendra",actualDOJ:"",offerMonth:"2024-06-24",phone:"9993777759",resignationAcceptance:"",proposedDOJ:"2024-06-12",owner:"Pragya",joiningStatus:"Backout",ctc:62000,statusCode:"Red",notes:"",createdAt:"2024-06-24",updatedAt:"2024-06-24",deleted:false },
  { id:81,sn:81,client:"Zytex",designation:"Sr. Account Ex",location:"Mumbai",name:"Rakesh Shirke",actualDOJ:"2024-06-17",offerMonth:"2024-06-24",phone:"9167317517",resignationAcceptance:"Done",proposedDOJ:"2024-06-17",owner:"Nivedita",joiningStatus:"Joined",ctc:45000,statusCode:"Green",notes:"",createdAt:"2024-06-24",updatedAt:"2024-06-24",deleted:false },
  { id:82,sn:82,client:"Metal Seam",designation:"Tool room Supervisor",location:"Lucknow",name:"Kritgya k Sahu",actualDOJ:"2024-07-01",offerMonth:"2024-06-24",phone:"9598425065",resignationAcceptance:"Done",proposedDOJ:"2024-07-01",owner:"Ragini",joiningStatus:"Offered",ctc:17000,statusCode:"Green",notes:"",createdAt:"2024-06-24",updatedAt:"2024-06-24",deleted:false },
  { id:83,sn:83,client:"Cornish",designation:"Store executive",location:"Noida",name:"Ajeet",actualDOJ:"2024-07-20",offerMonth:"2024-06-24",phone:"8708496961",resignationAcceptance:"Done",proposedDOJ:"2024-07-20",owner:"Chandni",joiningStatus:"Backout",ctc:25000,statusCode:"Red",notes:"",createdAt:"2024-06-24",updatedAt:"2024-06-24",deleted:false },
  { id:84,sn:84,client:"SM Auto",designation:"Jr. Industrial engineering",location:"Pune",name:"jitendra Panchal",actualDOJ:"2024-08-14",offerMonth:"2024-06-24",phone:"6353138082",resignationAcceptance:"Done",proposedDOJ:"2024-08-07",owner:"Ample Leap",joiningStatus:"Joined",ctc:50000,statusCode:"Green",notes:"",createdAt:"2024-06-24",updatedAt:"2024-06-24",deleted:false },
  { id:85,sn:85,client:"Metal Seam",designation:"quality inspector",location:"Lucknow",name:"Arjun Singh",actualDOJ:"2024-06-24",offerMonth:"2024-06-24",phone:"7905590291",resignationAcceptance:"Done",proposedDOJ:"2024-06-24",owner:"Chandni",joiningStatus:"Joined",ctc:17500,statusCode:"Green",notes:"",createdAt:"2024-06-24",updatedAt:"2024-06-24",deleted:false },
  { id:86,sn:86,client:"SM Auto",designation:"Sr. Officer QA MIS",location:"Pune",name:"Vinod Dhamne",actualDOJ:"2024-07-12",offerMonth:"2024-07-24",phone:"9765883611",resignationAcceptance:"Done",proposedDOJ:"2024-07-09",owner:"Sanjay Sir",joiningStatus:"Joined",ctc:45000,statusCode:"Green",notes:"",createdAt:"2024-07-24",updatedAt:"2024-07-24",deleted:false },
  { id:87,sn:87,client:"SM Auto",designation:"EA to M D",location:"Pune",name:"Daniel Francis John",actualDOJ:"",offerMonth:"2024-07-24",phone:"7709982264",resignationAcceptance:"",proposedDOJ:"2024-07-16",owner:"Sanjay Sir",joiningStatus:"Backout",ctc:53000,statusCode:"Red",notes:"",createdAt:"2024-07-24",updatedAt:"2024-07-24",deleted:false },
  { id:88,sn:88,client:"Fratelli Wines",designation:"Deputy Manager HR",location:"Delhi",name:"Upendra",actualDOJ:"2024-07-08",offerMonth:"2024-07-24",phone:"",resignationAcceptance:"Done",proposedDOJ:"2024-07-08",owner:"Pragya",joiningStatus:"Joined",ctc:62500,statusCode:"Green",notes:"",createdAt:"2024-07-24",updatedAt:"2024-07-24",deleted:false },
  { id:89,sn:89,client:"Alicon",designation:"IT Manager SAP",location:"Pune",name:"Sachin Gulve",actualDOJ:"2024-07-15",offerMonth:"2024-07-24",phone:"9975219437",resignationAcceptance:"Done",proposedDOJ:"2024-07-15",owner:"Raksha",joiningStatus:"Joined",ctc:140000,statusCode:"Red",notes:"",createdAt:"2024-07-24",updatedAt:"2024-07-24",deleted:false },
  { id:90,sn:90,client:"Mirzapur Electrical",designation:"HR Manager",location:"Mirzapur",name:"Manoj Singh",actualDOJ:"2024-07-01",offerMonth:"2024-07-24",phone:"7052386538",resignationAcceptance:"Done",proposedDOJ:"2024-07-01",owner:"Manish Sir",joiningStatus:"Joined",ctc:50000,statusCode:"Green",notes:"",createdAt:"2024-07-24",updatedAt:"2024-07-24",deleted:false },
  { id:91,sn:91,client:"Gyandhara",designation:"Marketing Manager",location:"Lucknow",name:"Raghvendra",actualDOJ:"2024-08-14",offerMonth:"2024-07-24",phone:"8400790084",resignationAcceptance:"Done",proposedDOJ:"2024-08-23",owner:"Chandni",joiningStatus:"Joined",ctc:116667,statusCode:"Green",notes:"",createdAt:"2024-07-24",updatedAt:"2024-07-24",deleted:false },
  { id:92,sn:92,client:"Alicon",designation:"Sales Accounting",location:"Pune",name:"Vaibhav",actualDOJ:"",offerMonth:"2024-07-24",phone:"9765703272",resignationAcceptance:"",proposedDOJ:"2024-09-02",owner:"Raksha",joiningStatus:"Backout",ctc:50000,statusCode:"Red",notes:"",createdAt:"2024-07-24",updatedAt:"2024-07-24",deleted:false },
  { id:93,sn:93,client:"Corob",designation:"quality engineer - CMM",location:"Vapi",name:"Manoj Irase",actualDOJ:"2024-08-01",offerMonth:"2024-07-24",phone:"9356717882",resignationAcceptance:"Done",proposedDOJ:"2024-08-01",owner:"Sanjay Sir",joiningStatus:"Joined",ctc:35000,statusCode:"Green",notes:"",createdAt:"2024-07-24",updatedAt:"2024-07-24",deleted:false },
  { id:94,sn:94,client:"Gyan Dairy",designation:"Technical officer",location:"Lucknow",name:"Akash Awasthi",actualDOJ:"2024-07-25",offerMonth:"2024-07-24",phone:"7007635246",resignationAcceptance:"Done",proposedDOJ:"2024-07-25",owner:"Chandni",joiningStatus:"Joined",ctc:24000,statusCode:"Green",notes:"",createdAt:"2024-07-24",updatedAt:"2024-07-24",deleted:false },
  { id:95,sn:95,client:"Alicon",designation:"Safety officer",location:"Pune",name:"Monu",actualDOJ:"2024-08-05",offerMonth:"2024-07-24",phone:"8806926800",resignationAcceptance:"Done",proposedDOJ:"2024-08-05",owner:"Shivangi",joiningStatus:"Joined",ctc:79000,statusCode:"Green",notes:"",createdAt:"2024-07-24",updatedAt:"2024-07-24",deleted:false },
  { id:96,sn:96,client:"Vista Processed Foods",designation:"NPD Manager",location:"Mumbai",name:"Krishnendu",actualDOJ:"2024-09-02",offerMonth:"2024-07-24",phone:"7503803368",resignationAcceptance:"Done",proposedDOJ:"2024-09-15",owner:"Chandni",joiningStatus:"Joined",ctc:104166,statusCode:"Green",notes:"",createdAt:"2024-07-24",updatedAt:"2024-07-24",deleted:false },
  { id:97,sn:97,client:"Mirzapur Electrical",designation:"Accounts Manager",location:"Lucknow",name:"Naveen",actualDOJ:"",offerMonth:"2024-07-24",phone:"8699022405",resignationAcceptance:"",proposedDOJ:"2024-08-05",owner:"Nivedita",joiningStatus:"Backout",ctc:54000,statusCode:"Red",notes:"",createdAt:"2024-07-24",updatedAt:"2024-07-24",deleted:false },
  { id:98,sn:98,client:"Vista Processed Foods",designation:"NPD AM Manager",location:"Mumbai",name:"Gilbert",actualDOJ:"2024-09-16",offerMonth:"2024-07-24",phone:"7598831654",resignationAcceptance:"Done",proposedDOJ:"2024-09-16",owner:"Chandni",joiningStatus:"Joined",ctc:66000,statusCode:"Green",notes:"",createdAt:"2024-07-24",updatedAt:"2024-07-24",deleted:false },
  { id:99,sn:99,client:"Metal Seam",designation:"HR Manager",location:"Lucknow",name:"Saurabh Saxena",actualDOJ:"",offerMonth:"2024-07-24",phone:"9644355814",resignationAcceptance:"",proposedDOJ:"2024-09-02",owner:"Raksha",joiningStatus:"Backout",ctc:80000,statusCode:"Red",notes:"",createdAt:"2024-07-24",updatedAt:"2024-07-24",deleted:false },
  { id:100,sn:100,client:"Cornish",designation:"Store Incharge",location:"Noida",name:"Raj Kumar",actualDOJ:"2024-08-12",offerMonth:"2024-07-24",phone:"",resignationAcceptance:"Done",proposedDOJ:"2024-08-12",owner:"Pragya",joiningStatus:"Joined",ctc:30000,statusCode:"Red",notes:"",createdAt:"2024-07-24",updatedAt:"2024-07-24",deleted:false },
  { id:101,sn:101,client:"Fratelli Wines",designation:"HR Generalist",location:"chhatarpur",name:"Gaurav singh",actualDOJ:"2024-08-26",offerMonth:"2024-07-24",phone:"9236442039",resignationAcceptance:"Done",proposedDOJ:"2024-08-26",owner:"Shivangi",joiningStatus:"Joined",ctc:45000,statusCode:"Green",notes:"",createdAt:"2024-07-24",updatedAt:"2024-07-24",deleted:false },
  { id:102,sn:102,client:"Payal Group",designation:"Senior Engineer Process",location:"Dahej",name:"Jenis Zaverbhai",actualDOJ:"",offerMonth:"2024-07-24",phone:"7878508282",resignationAcceptance:"",proposedDOJ:"1st October",owner:"Raksha",joiningStatus:"Backout",ctc:58000,statusCode:"Red",notes:"",createdAt:"2024-07-24",updatedAt:"2024-07-24",deleted:false },
  { id:103,sn:103,client:"Polytech Synergy",designation:"Technical Sales manager",location:"Delhi",name:"Nitin Thapiyal",actualDOJ:"2024-08-10",offerMonth:"2024-08-24",phone:"9958713099",resignationAcceptance:"Done",proposedDOJ:"2024-08-10",owner:"Sanjay Sir",joiningStatus:"Joined",ctc:70000,statusCode:"Green",notes:"",createdAt:"2024-08-24",updatedAt:"2024-08-24",deleted:false },
  { id:104,sn:104,client:"Metal Seam",designation:"Internal Auditor",location:"Lucknow",name:"Surya Shankar Mishra",actualDOJ:"2024-09-16",offerMonth:"2024-08-24",phone:"9795243533",resignationAcceptance:"Done",proposedDOJ:"2024-09-16",owner:"Nivedita",joiningStatus:"Joined",ctc:46250,statusCode:"Green",notes:"",createdAt:"2024-08-24",updatedAt:"2024-08-24",deleted:false },
  { id:105,sn:105,client:"Gyandhara",designation:"Sales coordinator",location:"Lucknow",name:"Raj Singh",actualDOJ:"2024-08-12",offerMonth:"2024-08-24",phone:"8793706007",resignationAcceptance:"Done",proposedDOJ:"2024-08-12",owner:"Chandni",joiningStatus:"Joined",ctc:87500,statusCode:"Green",notes:"",createdAt:"2024-08-24",updatedAt:"2024-08-24",deleted:false },
  { id:106,sn:106,client:"Metal Seam",designation:"production Incharge",location:"Lucknow",name:"Rakesh",actualDOJ:"2024-08-21",offerMonth:"2024-08-24",phone:"8392827271",resignationAcceptance:"Done",proposedDOJ:"2024-08-21",owner:"Shivangi",joiningStatus:"Joined",ctc:35000,statusCode:"Red",notes:"",createdAt:"2024-08-24",updatedAt:"2024-08-24",deleted:false },
  { id:107,sn:107,client:"CMR",designation:"Quality Manager",location:"faridabad",name:"Rajeev Mahto",actualDOJ:"2024-09-02",offerMonth:"2024-08-24",phone:"9608179717",resignationAcceptance:"Done",proposedDOJ:"2024-09-02",owner:"Shivangi",joiningStatus:"Joined",ctc:87000,statusCode:"Green",notes:"",createdAt:"2024-08-24",updatedAt:"2024-08-24",deleted:false },
  { id:108,sn:108,client:"Polytech Synergy",designation:"HR Manager",location:"Delhi",name:"Sanat kumar Bid",actualDOJ:"2 St Sep",offerMonth:"2024-08-24",phone:"9650953694",resignationAcceptance:"Done",proposedDOJ:"1 St Sep",owner:"Raksha",joiningStatus:"Joined",ctc:55000,statusCode:"Red",notes:"",createdAt:"2024-08-24",updatedAt:"2024-08-24",deleted:false },
  { id:109,sn:109,client:"Alicon",designation:"Production-LPDC",location:"Binola",name:"Nirmal verma",actualDOJ:"2024-07-24",offerMonth:"2024-08-24",phone:"",resignationAcceptance:"Done",proposedDOJ:"2024-07-24",owner:"Ample Leap",joiningStatus:"Joined",ctc:65000,statusCode:"Green",notes:"",createdAt:"2024-08-24",updatedAt:"2024-08-24",deleted:false },
  { id:110,sn:110,client:"Polytech Synergy",designation:"Social Media Manager",location:"Delhi",name:"Anirudh kaushik",actualDOJ:"2024-07-20",offerMonth:"2024-08-24",phone:"7988703257",resignationAcceptance:"Completed",proposedDOJ:"2024-07-20",owner:"Pallavi",joiningStatus:"Joined",ctc:40000,statusCode:"Red",notes:"",createdAt:"2024-08-24",updatedAt:"2024-08-24",deleted:false },
  { id:111,sn:111,client:"Vista Processed Foods",designation:"Assist Mananger",location:"Sirhind",name:"Kapil Sharma",actualDOJ:"2024-09-23",offerMonth:"2024-08-24",phone:"7018813757",resignationAcceptance:"Completed",proposedDOJ:"2024-09-25",owner:"Sanjay Sir",joiningStatus:"Offered",ctc:54000,statusCode:"Green",notes:"",createdAt:"2024-08-24",updatedAt:"2024-08-24",deleted:false },
  { id:112,sn:112,client:"Alicon",designation:"AGM/DGM HR",location:"Shikrapur",name:"Mukesh Kumar",actualDOJ:"2024-09-19",offerMonth:"2024-08-24",phone:"9975904579",resignationAcceptance:"Done",proposedDOJ:"2024-09-19",owner:"Pallavi",joiningStatus:"Joined",ctc:250000,statusCode:"Red",notes:"",createdAt:"2024-08-24",updatedAt:"2024-08-24",deleted:false },
  { id:113,sn:113,client:"SM Auto",designation:"NPD",location:"Housure",name:"Boopalan S",actualDOJ:"2024-11-11",offerMonth:"2024-08-24",phone:"6388146092",resignationAcceptance:"Done",proposedDOJ:"2024-11-02",owner:"Shivangi",joiningStatus:"Joined",ctc:45000,statusCode:"Green",notes:"",createdAt:"2024-08-24",updatedAt:"2024-08-24",deleted:false },
  { id:114,sn:114,client:"Translight Scaff",designation:"Am accounts",location:"Ghaziabad",name:"Deepak Kumar",actualDOJ:"",offerMonth:"2024-09-24",phone:"9548605970",resignationAcceptance:"",proposedDOJ:"2024-09-23",owner:"Pragya",joiningStatus:"Backout",ctc:40000,statusCode:"Red",notes:"",createdAt:"2024-09-24",updatedAt:"2024-09-24",deleted:false },
  { id:115,sn:115,client:"Titan Biotech",designation:"Import manager",location:"Delhi",name:"Nitin Singhal",actualDOJ:"2024-10-05",offerMonth:"2024-09-24",phone:"9784899087",resignationAcceptance:"completed",proposedDOJ:"2024-10-10",owner:"Pallavi",joiningStatus:"Joined",ctc:100000,statusCode:"Green",notes:"",createdAt:"2024-09-24",updatedAt:"2024-09-24",deleted:false },
  { id:116,sn:116,client:"Metal Seam",designation:"PPC Manager",location:"Lucknow",name:"Shyam Narayan Mishra",actualDOJ:"2024-10-15",offerMonth:"2024-09-24",phone:"=918800263208",resignationAcceptance:"Done",proposedDOJ:"2024-10-15",owner:"Chandni",joiningStatus:"Joined",ctc:85000,statusCode:"Green",notes:"",createdAt:"2024-09-24",updatedAt:"2024-09-24",deleted:false },
  { id:117,sn:117,client:"Metal Seam",designation:"PPC Executive",location:"Lucknow",name:"Rahul Pal",actualDOJ:"2024-10-07",offerMonth:"2024-09-24",phone:"=918353981845",resignationAcceptance:"Done",proposedDOJ:"2024-10-07",owner:"Chandni",joiningStatus:"Joined",ctc:30000,statusCode:"Green",notes:"",createdAt:"2024-09-24",updatedAt:"2024-09-24",deleted:false },
  { id:118,sn:118,client:"KM Sugar",designation:"Project accountant",location:"Faizabad",name:"Sushil Kumar",actualDOJ:"2024-09-16",offerMonth:"2024-09-24",phone:"",resignationAcceptance:"Done",proposedDOJ:"2024-09-16",owner:"Nivedita",joiningStatus:"Joined",ctc:41000,statusCode:"Green",notes:"",createdAt:"2024-09-24",updatedAt:"2024-09-24",deleted:false },
  { id:119,sn:119,client:"Tatsa Innovation",designation:"Assistant Accountant",location:"Noida",name:"Shivam",actualDOJ:"2024-10-01",offerMonth:"2024-09-24",phone:"",resignationAcceptance:"",proposedDOJ:"2024-10-01",owner:"Pragya",joiningStatus:"Backout",ctc:30000,statusCode:"Red",notes:"",createdAt:"2024-09-24",updatedAt:"2024-09-24",deleted:false },
  { id:120,sn:120,client:"Metal Seam",designation:"Store executive",location:"Lucknow",name:"Vaibhav",actualDOJ:"1st oct",offerMonth:"2024-09-24",phone:"8924048976",resignationAcceptance:"Done",proposedDOJ:"1st oct",owner:"Pallavi",joiningStatus:"Joined",ctc:20000,statusCode:"Green",notes:"",createdAt:"2024-09-24",updatedAt:"2024-09-24",deleted:false },
  { id:121,sn:121,client:"Metal Seam",designation:"Sr. engineer production",location:"Lucknow",name:"Rakesh Tiwari",actualDOJ:"2024-10-28",offerMonth:"2024-09-24",phone:"7827496593",resignationAcceptance:"Done",proposedDOJ:"2024-10-28",owner:"Aditya",joiningStatus:"Joined",ctc:40000,statusCode:"Red",notes:"",createdAt:"2024-09-24",updatedAt:"2024-09-24",deleted:false },
  { id:122,sn:122,client:"SM Auto",designation:"PPC executive",location:"Hosure",name:"Bharat A",actualDOJ:"1st oct",offerMonth:"2024-09-24",phone:"8870553526",resignationAcceptance:"Done",proposedDOJ:"1st oct",owner:"Sanjay Sir",joiningStatus:"Joined",ctc:31500,statusCode:"Green",notes:"",createdAt:"2024-09-24",updatedAt:"2024-09-24",deleted:false },
  { id:123,sn:123,client:"Metal Seam",designation:"Purchase Executive",location:"Lucknow",name:"Aryan Yadav",actualDOJ:"2024-10-10",offerMonth:"2024-09-24",phone:"7408412496",resignationAcceptance:"completed",proposedDOJ:"2024-10-10",owner:"Pallavi",joiningStatus:"Backout",ctc:16666,statusCode:"Red",notes:"",createdAt:"2024-09-24",updatedAt:"2024-09-24",deleted:false },
  { id:124,sn:124,client:"Arkelite",designation:"Sales executive",location:"Raipur",name:"Vaibhav",actualDOJ:"",offerMonth:"2024-09-24",phone:"9074885492",resignationAcceptance:"",proposedDOJ:"5 th Nov",owner:"Raksha",joiningStatus:"Offered",ctc:25000,statusCode:"Red",notes:"",createdAt:"2024-09-24",updatedAt:"2024-09-24",deleted:false },
  { id:125,sn:125,client:"Visaava Industry",designation:"production Manager",location:"Lucknow",name:"Pankaj Verma",actualDOJ:"2024-11-11",offerMonth:"2024-10-24",phone:"9532245181",resignationAcceptance:"Done",proposedDOJ:"2024-11-11",owner:"Chandni",joiningStatus:"Joined",ctc:56666,statusCode:"Red",notes:"",createdAt:"2024-10-24",updatedAt:"2024-10-24",deleted:false },
  { id:126,sn:126,client:"Jindal SAW",designation:"AM Finance",location:"Solapur",name:"Ranjeet kumar Jha",actualDOJ:"2024-10-22",offerMonth:"2024-10-24",phone:"9768985909",resignationAcceptance:"Done",proposedDOJ:"2024-10-22",owner:"Raksha",joiningStatus:"Joined",ctc:64000,statusCode:"Green",notes:"",createdAt:"2024-10-24",updatedAt:"2024-10-24",deleted:false },
  { id:127,sn:127,client:"Metal Seam",designation:"Production manager",location:"Lucknow",name:"Ramadeen",actualDOJ:"",offerMonth:"2024-10-24",phone:"8626829242",resignationAcceptance:"Received",proposedDOJ:"2024-11-11",owner:"Chandni",joiningStatus:"Offered",ctc:72000,statusCode:"Red",notes:"",createdAt:"2024-10-24",updatedAt:"2024-10-24",deleted:false },
  { id:128,sn:128,client:"Jindal SAW",designation:"HR",location:"Solapur",name:"Shekhar",actualDOJ:"2024-11-14",offerMonth:"2024-10-24",phone:"8856062110",resignationAcceptance:"Done",proposedDOJ:"2024-11-15",owner:"Pragya",joiningStatus:"Joined",ctc:35000,statusCode:"Green",notes:"",createdAt:"2024-10-24",updatedAt:"2024-10-24",deleted:false },
  { id:129,sn:129,client:"India Forge",designation:"AGM finance",location:"Faridabad",name:"Ajit Mishra",actualDOJ:"2024-10-21",offerMonth:"2024-10-24",phone:"9911513126",resignationAcceptance:"Done",proposedDOJ:"2024-10-25",owner:"Raksha",joiningStatus:"Joined",ctc:193000,statusCode:"Green",notes:"",createdAt:"2024-10-24",updatedAt:"2024-10-24",deleted:false },
  { id:130,sn:130,client:"Metal Seam",designation:"Head OE-MD Office",location:"Lucknow",name:"Jai Prakash Singh",actualDOJ:"2025-11-06",offerMonth:"2024-10-24",phone:"9999745261",resignationAcceptance:"Done",proposedDOJ:"6th Nov",owner:"Aditya",joiningStatus:"Joined",ctc:100000,statusCode:"Green",notes:"",createdAt:"2024-10-24",updatedAt:"2024-10-24",deleted:false },
  { id:131,sn:131,client:"Gyandhara",designation:"Admin",location:"Lucknow",name:"Deependra Awasthi",actualDOJ:"2024-10-21",offerMonth:"2024-10-24",phone:"7985442169",resignationAcceptance:"Done",proposedDOJ:"2024-10-24",owner:"Sweety",joiningStatus:"Joined",ctc:25000,statusCode:"Green",notes:"",createdAt:"2024-10-24",updatedAt:"2024-10-24",deleted:false },
  { id:132,sn:132,client:"Corob",designation:"Quality manager",location:"Mumbai",name:"Amol Tanaji Kanawade",actualDOJ:"",offerMonth:"2024-10-24",phone:"=918055065544",resignationAcceptance:"",proposedDOJ:"2024-12-16",owner:"Chandni",joiningStatus:"Offered",ctc:120000,statusCode:"Red",notes:"",createdAt:"2024-10-24",updatedAt:"2024-10-24",deleted:false },
  { id:133,sn:133,client:"Vista Processed Foods",designation:"Product Development Pet food",location:"Mumbai",name:"Sanket Vijay jawal",actualDOJ:"2024-12-23",offerMonth:"2024-10-24",phone:"8655652675",resignationAcceptance:"Done",proposedDOJ:"2024-12-23",owner:"Chandni",joiningStatus:"Joined",ctc:200000,statusCode:"Green",notes:"",createdAt:"2024-10-24",updatedAt:"2024-10-24",deleted:false },
  { id:134,sn:134,client:"SM Auto",designation:"Fixture maintenance Engineer",location:"Hosur",name:"Kanak Ranjith",actualDOJ:"2024-12-02",offerMonth:"2024-10-24",phone:"7708807264",resignationAcceptance:"pending",proposedDOJ:"2024-12-02",owner:"Sweety",joiningStatus:"Joined",ctc:25000,statusCode:"Green",notes:"",createdAt:"2024-10-24",updatedAt:"2024-10-24",deleted:false },
  { id:135,sn:135,client:"Alicon",designation:"Sr. manager finance",location:"Binola",name:"Ashok  kumar",actualDOJ:"",offerMonth:"2024-10-24",phone:"8802064244",resignationAcceptance:"Pending",proposedDOJ:"2024-12-02",owner:"Aditya",joiningStatus:"Backout",ctc:166666,statusCode:"Red",notes:"",createdAt:"2024-10-24",updatedAt:"2024-10-24",deleted:false },
  { id:136,sn:136,client:"Metal Seam",designation:"Sr HR Manager",location:"Lucknow",name:"Ramesh Mishra",actualDOJ:"2024-11-09",offerMonth:"2024-11-24",phone:"9670235859",resignationAcceptance:"Done",proposedDOJ:"2024-11-09",owner:"Manish Sir",joiningStatus:"Joined",ctc:83000,statusCode:"Green",notes:"",createdAt:"2024-11-24",updatedAt:"2024-11-24",deleted:false },
  { id:139,sn:139,client:"CMR",designation:"Deputy Manager",location:"Faridabad",name:"Pankaj Dubey",actualDOJ:"2024-12-02",offerMonth:"2024-11-24",phone:"8447008219",resignationAcceptance:"Done",proposedDOJ:"2nd Dec",owner:"Anshika",joiningStatus:"Joined",ctc:50000,statusCode:"Green",notes:"",createdAt:"2024-11-24",updatedAt:"2024-11-24",deleted:false },
  { id:138,sn:138,client:"Corob",designation:"Manager QA",location:"Corporate Office",name:"Ashish Gour",actualDOJ:"2024-01-01",offerMonth:"2024-11-24",phone:"9752919132",resignationAcceptance:"Done",proposedDOJ:"2024-01-01",owner:"Sanjay Sir",joiningStatus:"Joined",ctc:162000,statusCode:"Green",notes:"",createdAt:"2024-11-24",updatedAt:"2024-11-24",deleted:false },
  { id:137,sn:137,client:"CMR",designation:"Corporate Insurance",location:"Faridabad",name:"Hemant Kumar",actualDOJ:"2024-12-16",offerMonth:"2024-11-24",phone:"9990096132",resignationAcceptance:"Done",proposedDOJ:"2024-12-16",owner:"Chandni",joiningStatus:"Backout",ctc:131000,statusCode:"Red",notes:"",createdAt:"2024-11-24",updatedAt:"2024-11-24",deleted:false },
  { id:140,sn:140,client:"Gyandhara",designation:"Purchase Manager",location:"Lucknow",name:"Abhishek verma",actualDOJ:"2024-12-06",offerMonth:"2024-11-24",phone:"8953000101",resignationAcceptance:"Done",proposedDOJ:"2024-12-05",owner:"Raksha",joiningStatus:"Joined",ctc:68000,statusCode:"Green",notes:"",createdAt:"2024-11-24",updatedAt:"2024-11-24",deleted:false },
  { id:141,sn:141,client:"SM Auto",designation:"Quality Head",location:"Pune",name:"Chandrakant Deshmukh",actualDOJ:"",offerMonth:"2024-11-24",phone:"9175611088",resignationAcceptance:"",proposedDOJ:"2024-12-02",owner:"Pallavi",joiningStatus:"Backout",ctc:75000,statusCode:"Red",notes:"",createdAt:"2024-11-24",updatedAt:"2024-11-24",deleted:false },
  { id:142,sn:142,client:"Vansh",designation:"Am HR",location:"Baddi",name:"Mukesh Awasthi",actualDOJ:"2024-12-24",offerMonth:"2024-11-24",phone:"9005899049",resignationAcceptance:"Done",proposedDOJ:"2024-12-19",owner:"Manish Sir",joiningStatus:"Joined",ctc:52000,statusCode:"Green",notes:"",createdAt:"2024-11-24",updatedAt:"2024-11-24",deleted:false },
  { id:143,sn:143,client:"Metal Seam",designation:"Am maintenance",location:"Lucknow",name:"Om Prakash Singh",actualDOJ:"2024-01-17",offerMonth:"2024-11-24",phone:"8983224898",resignationAcceptance:"Done",proposedDOJ:"2024-01-17",owner:"Chandni",joiningStatus:"Joined",ctc:63000,statusCode:"Green",notes:"",createdAt:"2024-11-24",updatedAt:"2024-11-24",deleted:false },
  { id:144,sn:144,client:"Suspa",designation:"Am maintenance",location:"Sanand",name:"Mitesh",actualDOJ:"2024-01-30",offerMonth:"2024-11-24",phone:"7486000262",resignationAcceptance:"Done",proposedDOJ:"2024-01-30",owner:"Chandni",joiningStatus:"Joined",ctc:56000,statusCode:"Green",notes:"",createdAt:"2024-11-24",updatedAt:"2024-11-24",deleted:false },
  { id:145,sn:145,client:"Metal Seam",designation:"Production manager",location:"Lucknow",name:"Sumant Kumar",actualDOJ:"2024-12-26",offerMonth:"2024-11-24",phone:"8398912189",resignationAcceptance:"Done",proposedDOJ:"2024-12-26",owner:"Chandni",joiningStatus:"Joined",ctc:63000,statusCode:"Green",notes:"",createdAt:"2024-11-24",updatedAt:"2024-11-24",deleted:false },
  { id:146,sn:146,client:"Metal Seam",designation:"Maintenance manager",location:"Lucknow",name:"Santosh Kumar yadav",actualDOJ:"2024-12-20",offerMonth:"2024-11-24",phone:"9997199947",resignationAcceptance:"Done",proposedDOJ:"2024-12-16",owner:"Chandni",joiningStatus:"Joined",ctc:76000,statusCode:"Red",notes:"",createdAt:"2024-11-24",updatedAt:"2024-11-24",deleted:false },
  { id:147,sn:147,client:"Metal Seam",designation:"Design Engineer",location:"Lucknow",name:"Shivam",actualDOJ:"2024-12-02",offerMonth:"2024-11-24",phone:"9267979802",resignationAcceptance:"Done",proposedDOJ:"2024-12-02",owner:"Nivedita",joiningStatus:"Joined",ctc:37000,statusCode:"Green",notes:"",createdAt:"2024-11-24",updatedAt:"2024-11-24",deleted:false },
  { id:148,sn:148,client:"Alicon",designation:"Plant Head",location:"Binola",name:"Tilak Raj",actualDOJ:"2024-12-02",offerMonth:"2024-12-24",phone:"9953120347",resignationAcceptance:"Done",proposedDOJ:"2024-12-02",owner:"Anshika",joiningStatus:"Joined",ctc:192000,statusCode:"Red",notes:"",createdAt:"2024-12-24",updatedAt:"2024-12-24",deleted:false },
  { id:149,sn:149,client:"Vansh",designation:"AM HR payroll",location:"Noida",name:"Rahul singla",actualDOJ:"2024-12-11",offerMonth:"2024-12-24",phone:"9518519999",resignationAcceptance:"Done",proposedDOJ:"2024-12-11",owner:"Sweety",joiningStatus:"Joined",ctc:50000,statusCode:"Green",notes:"",createdAt:"2024-12-24",updatedAt:"2024-12-24",deleted:false },
  { id:150,sn:150,client:"Alicon",designation:"Finance and accounts",location:"Binola",name:"Sandeep",actualDOJ:"5 th Jan",offerMonth:"2024-12-24",phone:"9992993517",resignationAcceptance:"Done",proposedDOJ:"2024-01-05",owner:"Raksha",joiningStatus:"Joined",ctc:126000,statusCode:"Green",notes:"",createdAt:"2024-12-24",updatedAt:"2024-12-24",deleted:false },
  { id:151,sn:151,client:"LINUS International",designation:"Executive Assistant",location:"Dubai",name:"Sanitha.P",actualDOJ:"2024-12-23",offerMonth:"2024-12-24",phone:"971562117780",resignationAcceptance:"Done",proposedDOJ:"2024-12-23",owner:"Anshika",joiningStatus:"Joined",ctc:40000,statusCode:"Green",notes:"",createdAt:"2024-12-24",updatedAt:"2024-12-24",deleted:false },
  { id:152,sn:152,client:"Metal Seam",designation:"Quality Executive",location:"Lucknow",name:"Sachin kunar Singh",actualDOJ:"2025-01-24",offerMonth:"2024-12-24",phone:"7007282273",resignationAcceptance:"Done",proposedDOJ:"2024-01-20",owner:"Chandni",joiningStatus:"Joined",ctc:20000,statusCode:"Green",notes:"",createdAt:"2024-12-24",updatedAt:"2024-12-24",deleted:false },
  { id:198,sn:198,client:"CMR",designation:"Front office",location:"Faridabad",name:"Dolly katuria",actualDOJ:"2025-05-15",offerMonth:"2025-04-25",phone:"8130110103",resignationAcceptance:"Done",proposedDOJ:"2025-05-15",owner:"Shruti",joiningStatus:"Joined",ctc:45000,statusCode:"Green",notes:"",createdAt:"2025-04-25",updatedAt:"2025-04-25",deleted:false },
  { id:154,sn:154,client:"FIL Industries",designation:"Finance Executive",location:"Delhi",name:"Sanju Jeenwal",actualDOJ:"2024-12-26",offerMonth:"2024-12-24",phone:"9599753464",resignationAcceptance:"Done",proposedDOJ:"2024-12-26",owner:"Chandni",joiningStatus:"Joined",ctc:33000,statusCode:"Green",notes:"",createdAt:"2024-12-24",updatedAt:"2024-12-24",deleted:false },
  { id:155,sn:155,client:"Alicon",designation:"Sales and Marketing head",location:"Pune",name:"Chetan Bheed",actualDOJ:"2025-02-03",offerMonth:"2024-12-24",phone:"9236393818",resignationAcceptance:"Done",proposedDOJ:"2025-02-03",owner:"Pallavi",joiningStatus:"Joined",ctc:400000,statusCode:"Green",notes:"",createdAt:"2024-12-24",updatedAt:"2024-12-24",deleted:false },
  { id:157,sn:157,client:"Metal Seam",designation:"Production Supervisor",location:"Lucknow",name:"Rishikesh Vishwakarma",actualDOJ:"2025-01-21",offerMonth:"2025-01-25",phone:"8511690246",resignationAcceptance:"Done",proposedDOJ:"Doj - 21 Jan",owner:"Chandni",joiningStatus:"Joined",ctc:30000,statusCode:"Red",notes:"",createdAt:"2025-01-25",updatedAt:"2025-01-25",deleted:false },
  { id:158,sn:158,client:"Vivo",designation:"AM production Materials",location:"G. Noida",name:"Akash pandey",actualDOJ:"2025-04-02",offerMonth:"2025-01-25",phone:"8447836017",resignationAcceptance:"Done",proposedDOJ:"2025-04-02",owner:"Sweety",joiningStatus:"Joined",ctc:95000,statusCode:"Green",notes:"",createdAt:"2025-01-25",updatedAt:"2025-01-25",deleted:false },
  { id:159,sn:159,client:"Vista Processed Foods",designation:"Qulity officer",location:"Sirhind",name:"Akhil Rana",actualDOJ:"2025-02-03",offerMonth:"2025-01-25",phone:"9915017724",resignationAcceptance:"Done",proposedDOJ:"2025-02-03",owner:"Chandni",joiningStatus:"Joined",ctc:43333,statusCode:"Green",notes:"",createdAt:"2025-01-25",updatedAt:"2025-01-25",deleted:false },
  { id:160,sn:160,client:"Jindal SAW",designation:"safety officer",location:"Tembhurni",name:"Sunit kadam",actualDOJ:"",offerMonth:"2025-01-25",phone:"9975550052",resignationAcceptance:"",proposedDOJ:"2025-02-12",owner:"Sweety",joiningStatus:"Offered",ctc:58000,statusCode:"Red",notes:"",createdAt:"2025-01-25",updatedAt:"2025-01-25",deleted:false },
  { id:161,sn:161,client:"Arkelite",designation:"AM",location:"Sitapur",name:"Suraj Singh",actualDOJ:"2025-10-07",offerMonth:"2025-01-25",phone:"",resignationAcceptance:"Done",proposedDOJ:"2025-10-07",owner:"Shashank",joiningStatus:"Joined",ctc:24000,statusCode:"Green",notes:"",createdAt:"2025-01-25",updatedAt:"2025-01-25",deleted:false },
  { id:162,sn:162,client:"Vansh",designation:"Accounts Manager",location:"Noida",name:"shubham Agarwal",actualDOJ:"2025-02-01",offerMonth:"2025-01-25",phone:"9990862386",resignationAcceptance:"Done",proposedDOJ:"2025-02-01",owner:"Sweety",joiningStatus:"Left",ctc:100000,statusCode:"Red",notes:"",createdAt:"2025-01-25",updatedAt:"2025-01-25",deleted:false },
  { id:163,sn:163,client:"Alicon",designation:"Design Engineer",location:"Pune",name:"Sandip",actualDOJ:"2025-02-15",offerMonth:"2025-01-25",phone:"7709541773",resignationAcceptance:"Done",proposedDOJ:"2025-02-15",owner:"Nivedita",joiningStatus:"Joined",ctc:25000,statusCode:"Red",notes:"",createdAt:"2025-01-25",updatedAt:"2025-01-25",deleted:false },
  { id:164,sn:164,client:"Kokum Ply",designation:"Manager HR",location:"Lucknow",name:"Anurag tiwari",actualDOJ:"2025-03-15",offerMonth:"2025-01-25",phone:"9873985143",resignationAcceptance:"Done",proposedDOJ:"2025-03-15",owner:"Sameer Sir",joiningStatus:"Left",ctc:70000,statusCode:"Red",notes:"",createdAt:"2025-01-25",updatedAt:"2025-01-25",deleted:false },
  { id:165,sn:165,client:"Acme",designation:"General  Manager -Business",location:"dwarka",name:"Reena garg",actualDOJ:"2025-01-16",offerMonth:"2025-01-25",phone:"9811125047",resignationAcceptance:"Done",proposedDOJ:"2025-01-16",owner:"Sameer Sir",joiningStatus:"Joined",ctc:80000,statusCode:"Red",notes:"",createdAt:"2025-01-25",updatedAt:"2025-01-25",deleted:false },
  { id:166,sn:166,client:"Acme",designation:"HR head",location:"dwarka",name:"Kapil",actualDOJ:"2025-01-10",offerMonth:"2025-01-25",phone:"9910734977",resignationAcceptance:"Done",proposedDOJ:"2025-01-10",owner:"Raksha",joiningStatus:"Joined",ctc:108000,statusCode:"Green",notes:"",createdAt:"2025-01-25",updatedAt:"2025-01-25",deleted:false },
  { id:167,sn:167,client:"Metal Seam",designation:"Sr. Manager Purchase",location:"Lucknow",name:"Sanjay",actualDOJ:"2025-02-03",offerMonth:"2025-01-25",phone:"9540992755",resignationAcceptance:"Done",proposedDOJ:"2025-02-03",owner:"Raksha",joiningStatus:"Joined",ctc:105000,statusCode:"Red",notes:"",createdAt:"2025-01-25",updatedAt:"2025-01-25",deleted:false },
  { id:168,sn:168,client:"Vansh",designation:"Wearhouse incharge",location:"Noida",name:"Sumit Kumar",actualDOJ:"2025-02-24",offerMonth:"2025-02-25",phone:"8470937227",resignationAcceptance:"Done",proposedDOJ:"2025-02-25",owner:"Vikas",joiningStatus:"Joined",ctc:54000,statusCode:"Green",notes:"",createdAt:"2025-02-25",updatedAt:"2025-02-25",deleted:false },
  { id:169,sn:169,client:"Vivo",designation:"production",location:"G. Noida",name:"Piyush",actualDOJ:"2025-03-17",offerMonth:"2025-02-25",phone:"9627999386",resignationAcceptance:"Done",proposedDOJ:"2025-03-17",owner:"Sweety",joiningStatus:"Joined",ctc:64000,statusCode:"Green",notes:"",createdAt:"2025-02-25",updatedAt:"2025-02-25",deleted:false },
  { id:170,sn:170,client:"Vivo",designation:"Assembly planning",location:"G. Noida",name:"Deepak",actualDOJ:"07 th march",offerMonth:"2025-02-25",phone:"9696023097",resignationAcceptance:"Done",proposedDOJ:"2025-03-07",owner:"Nivedita",joiningStatus:"Joined",ctc:55000,statusCode:"Red",notes:"",createdAt:"2025-02-25",updatedAt:"2025-02-25",deleted:false },
  { id:171,sn:171,client:"SM Auto",designation:"Costing Manager",location:"Pune",name:"Sumit Narkhede",actualDOJ:"",offerMonth:"2025-02-25",phone:"8698691901",resignationAcceptance:"",proposedDOJ:"2025-03-17",owner:"Chandni",joiningStatus:"Offered",ctc:90000,statusCode:"Red",notes:"",createdAt:"2025-02-25",updatedAt:"2025-02-25",deleted:false },
  { id:172,sn:172,client:"Acme",designation:"HR Executive",location:"dwarka",name:"Sonali",actualDOJ:"",offerMonth:"2025-02-25",phone:"8059877413",resignationAcceptance:"pending",proposedDOJ:"2025-03-17",owner:"Nivedita",joiningStatus:"Offered",ctc:60000,statusCode:"Red",notes:"",createdAt:"2025-02-25",updatedAt:"2025-02-25",deleted:false },
  { id:173,sn:173,client:"Vista Processed Foods",designation:"Production Officer",location:"Sirhind",name:"Sachin Kumar",actualDOJ:"2025-03-05",offerMonth:"2025-02-25",phone:"7015627015",resignationAcceptance:"Done",proposedDOJ:"2025-03-03",owner:"Chandni",joiningStatus:"Joined",ctc:35000,statusCode:"Green",notes:"",createdAt:"2025-02-25",updatedAt:"2025-02-25",deleted:false },
  { id:174,sn:174,client:"Modern Insulator",designation:"Melting Incharge",location:"Rajsthan",name:"Sharvan Singh",actualDOJ:"2025-03-15",offerMonth:"2025-02-25",phone:"9860870230",resignationAcceptance:"Done",proposedDOJ:"2025-03-15",owner:"Chandni",joiningStatus:"Joined",ctc:66000,statusCode:"Green",notes:"",createdAt:"2025-02-25",updatedAt:"2025-02-25",deleted:false },
  { id:175,sn:175,client:"SM Auto",designation:"Assist Manager Quality",location:"Chakan",name:"Pankaj Chaudhary",actualDOJ:"2025-03-05",offerMonth:"2025-02-25",phone:"7972026726",resignationAcceptance:"Done",proposedDOJ:"2025-03-03",owner:"Sanjay Sir",joiningStatus:"Joined",ctc:55000,statusCode:"Red",notes:"",createdAt:"2025-02-25",updatedAt:"2025-02-25",deleted:false },
  { id:176,sn:176,client:"Metal Seam",designation:"Quality Head",location:"Lucknow",name:"Hemant Panday",actualDOJ:"",offerMonth:"2025-02-25",phone:"7985504511",resignationAcceptance:"pending",proposedDOJ:"2025-03-31",owner:"Chandni",joiningStatus:"Offered",ctc:85000,statusCode:"Red",notes:"",createdAt:"2025-02-25",updatedAt:"2025-02-25",deleted:false },
  { id:177,sn:177,client:"Payal Group",designation:"Purchase Head",location:"Noida",name:"Mohit arora",actualDOJ:"2025-04-02",offerMonth:"2025-02-25",phone:"9953933383",resignationAcceptance:"Done",proposedDOJ:"2025-04-02",owner:"Shashank",joiningStatus:"Joined",ctc:150000,statusCode:"Green",notes:"",createdAt:"2025-02-25",updatedAt:"2025-02-25",deleted:false },
  { id:178,sn:178,client:"Vivo",designation:"PMC engineer",location:"G. Noda",name:"Shivam Sharma",actualDOJ:"2025-03-03",offerMonth:"2025-02-25",phone:"9557774647",resignationAcceptance:"Done",proposedDOJ:"2025-02-26",owner:"Chandni",joiningStatus:"Joined",ctc:45000,statusCode:"Green",notes:"",createdAt:"2025-02-25",updatedAt:"2025-02-25",deleted:false },
  { id:179,sn:179,client:"Alicon",designation:"Defence Number 2",location:"Pune",name:"Sohel Vohra",actualDOJ:"23rd Feb 25",offerMonth:"2025-01-25",phone:"9924252433",resignationAcceptance:"Done",proposedDOJ:"23rd Feb 25",owner:"Pallavi",joiningStatus:"Joined",ctc:150000,statusCode:"Green",notes:"",createdAt:"2025-01-25",updatedAt:"2025-01-25",deleted:false },
  { id:180,sn:180,client:"Alicon",designation:"Marketing Manager",location:"Pune",name:"Rajendra Dake",actualDOJ:"23rd Feb 25",offerMonth:"2025-01-25",phone:"9767550288",resignationAcceptance:"Done",proposedDOJ:"23rd Feb 25",owner:"Pallavi",joiningStatus:"Joined",ctc:100000,statusCode:"Green",notes:"",createdAt:"2025-01-25",updatedAt:"2025-01-25",deleted:false },
  { id:181,sn:181,client:"Alicon",designation:"Marketing Manager",location:"Pune",name:"Anup Ingle",actualDOJ:"13th April 25",offerMonth:"2025-02-25",phone:"7798279683",resignationAcceptance:"Done",proposedDOJ:"13th April 25",owner:"Pallavi",joiningStatus:"Left",ctc:180000,statusCode:"Red",notes:"",createdAt:"2025-02-25",updatedAt:"2025-02-25",deleted:false },
  { id:182,sn:182,client:"KM Sugar",designation:"Area sales Manager",location:"Faizabad",name:"Satya Yadav",actualDOJ:"",offerMonth:"2025-03-25",phone:"8840944453",resignationAcceptance:"",proposedDOJ:"2025-03-11",owner:"Ayushi",joiningStatus:"Backout",ctc:40000,statusCode:"Red",notes:"",createdAt:"2025-03-25",updatedAt:"2025-03-25",deleted:false },
  { id:183,sn:183,client:"Pocl",designation:"Plant head",location:"pondichery",name:"Laxmi phani",actualDOJ:"2025-03-17",offerMonth:"2025-03-25",phone:"9533093848",resignationAcceptance:"Done",proposedDOJ:"2025-03-17",owner:"Nivedita",joiningStatus:"Joined",ctc:100000,statusCode:"Green",notes:"",createdAt:"2025-03-25",updatedAt:"2025-03-25",deleted:false },
  { id:184,sn:184,client:"Vivo",designation:"Assembly production engineer",location:"G. Noida",name:"Subrata Dey",actualDOJ:"2025-03-17",offerMonth:"2025-03-25",phone:"918697431221",resignationAcceptance:"Done",proposedDOJ:"2025-03-17",owner:"Chandni",joiningStatus:"Joined",ctc:45000,statusCode:"Green",notes:"",createdAt:"2025-03-25",updatedAt:"2025-03-25",deleted:false },
  { id:185,sn:185,client:"Urja Global",designation:"Sales BD",location:"Lucknow",name:"Binit kumar singh",actualDOJ:"2025-03-17",offerMonth:"2025-03-25",phone:"9696545494",resignationAcceptance:"Done",proposedDOJ:"2025-03-17",owner:"Raksha",joiningStatus:"Joined",ctc:65000,statusCode:"Green",notes:"",createdAt:"2025-03-25",updatedAt:"2025-03-25",deleted:false },
  { id:186,sn:186,client:"Arkelite",designation:"Sales Manager",location:"Orrissa",name:"Pradeep ojah",actualDOJ:"1st may 25",offerMonth:"2025-03-25",phone:"8917383061",resignationAcceptance:"pending",proposedDOJ:"1st May",owner:"Shashank",joiningStatus:"Joined",ctc:68000,statusCode:"Green",notes:"",createdAt:"2025-03-25",updatedAt:"2025-03-25",deleted:false },
  { id:187,sn:187,client:"Metal Seam",designation:"Senior engineer quality",location:"Lucknow",name:"Manoj Haider",actualDOJ:"2025-04-25",offerMonth:"2025-03-25",phone:"9997616309",resignationAcceptance:"Done",proposedDOJ:"2025-04-25",owner:"Chandni",joiningStatus:"Joined",ctc:36000,statusCode:"Red",notes:"",createdAt:"2025-03-25",updatedAt:"2025-03-25",deleted:false },
  { id:188,sn:188,client:"Pocl",designation:"Sales manager",location:"Tamilnadu",name:"Subrato Kundu",actualDOJ:"2025-04-07",offerMonth:"2025-03-25",phone:"9051438071",resignationAcceptance:"Done",proposedDOJ:"2025-04-07",owner:"Chandni",joiningStatus:"Joined",ctc:36000,statusCode:"Green",notes:"",createdAt:"2025-03-25",updatedAt:"2025-03-25",deleted:false },
  { id:189,sn:189,client:"Teena Group",designation:"Cost Accountant",location:"Delhi",name:"Pradeep Kumar",actualDOJ:"",offerMonth:"2025-03-25",phone:"9871012258",resignationAcceptance:"pending",proposedDOJ:"2025-05-15",owner:"Nivedita",joiningStatus:"Offered",ctc:125000,statusCode:"Red",notes:"",createdAt:"2025-03-25",updatedAt:"2025-03-25",deleted:false },
  { id:190,sn:190,client:"Pocl",designation:"Junior Chemist QC",location:"Tamilnadu",name:"Samy Ganesh",actualDOJ:"",offerMonth:"2025-03-25",phone:"8056408676",resignationAcceptance:"Done",proposedDOJ:"2025-04-21",owner:"Raksha",joiningStatus:"Offered",ctc:25000,statusCode:"Red",notes:"",createdAt:"2025-03-25",updatedAt:"2025-03-25",deleted:false },
  { id:191,sn:191,client:"SM Auto",designation:"Jr Costing Engineer",location:"Pimpri",name:"Shubham Chavan",actualDOJ:"3rd May 25",offerMonth:"2025-03-25",phone:"9850210067",resignationAcceptance:"pending",proposedDOJ:"2025-05-03",owner:"Sanjay Sir",joiningStatus:"Joined",ctc:30000,statusCode:"Green",notes:"",createdAt:"2025-03-25",updatedAt:"2025-03-25",deleted:false },
  { id:192,sn:192,client:"Modern Insulator",designation:"HR",location:"worli Mumbai",name:"Sagar Shiriskar",actualDOJ:"2nd may 25",offerMonth:"2025-03-25",phone:"9820569909",resignationAcceptance:"Done",proposedDOJ:"2025-04-22",owner:"Anshika",joiningStatus:"Joined",ctc:116000,statusCode:"Green",notes:"",createdAt:"2025-03-25",updatedAt:"2025-03-25",deleted:false },
  { id:193,sn:193,client:"Fratelli Wines",designation:"HR",location:"Chatarpur delhi",name:"Umita Gupta",actualDOJ:"14th April",offerMonth:"2025-04-25",phone:"9896347814",resignationAcceptance:"Done",proposedDOJ:"14th April",owner:"Pallavi",joiningStatus:"Joined",ctc:250000,statusCode:"Green",notes:"",createdAt:"2025-04-25",updatedAt:"2025-04-25",deleted:false },
  { id:194,sn:194,client:"Corob",designation:"Cost Analyst",location:"Nandigram-Bhilad",name:"Jitesh Shirodkar",actualDOJ:"2025-06-12",offerMonth:"2025-04-25",phone:"7798151031",resignationAcceptance:"Done",proposedDOJ:"12th June",owner:"Sanjay Sir",joiningStatus:"Offered",ctc:95000,statusCode:"Green",notes:"",createdAt:"2025-04-25",updatedAt:"2025-04-25",deleted:false },
  { id:195,sn:195,client:"Urja Global",designation:"BDM",location:"Uttrakhand & UP",name:"Shrikant Shukla",actualDOJ:"2025-04-25",offerMonth:"2025-04-25",phone:"9118000495",resignationAcceptance:"Done",proposedDOJ:"21TH April",owner:"Raksha",joiningStatus:"Joined",ctc:45000,statusCode:"Red",notes:"",createdAt:"2025-04-25",updatedAt:"2025-04-25",deleted:false },
  { id:196,sn:196,client:"Kokum Ply",designation:"Accountant",location:"Lucknow",name:"Pankaj",actualDOJ:"2025-05-25",offerMonth:"2025-04-25",phone:"9601654765",resignationAcceptance:"pending",proposedDOJ:"2025-05-15",owner:"Nivedita",joiningStatus:"Joined",ctc:58000,statusCode:"Green",notes:"",createdAt:"2025-04-25",updatedAt:"2025-04-25",deleted:false },
  { id:197,sn:197,client:"Raghushree Plast",designation:"sales coordinator",location:"Kanpur",name:"Adarsh mishra",actualDOJ:"15TH April",offerMonth:"2025-04-25",phone:"8299148604",resignationAcceptance:"Done",proposedDOJ:"15TH April",owner:"Shashank",joiningStatus:"Joined",ctc:26000,statusCode:"Green",notes:"",createdAt:"2025-04-25",updatedAt:"2025-04-25",deleted:false },
  { id:211,sn:211,client:"CMR",designation:"AM Quality",location:"Chennai",name:"Kannan",actualDOJ:"2025-06-16",offerMonth:"2025-05-25",phone:"9840886705",resignationAcceptance:"Pending",proposedDOJ:"DOJ- 16 July  2025",owner:"Nivedita",joiningStatus:"Joined",ctc:57000,statusCode:"Green",notes:"",createdAt:"2025-05-25",updatedAt:"2025-05-25",deleted:false },
  { id:199,sn:199,client:"Alicon",designation:"Defence Head",location:"Pune",name:"Harsh Gune",actualDOJ:"15th Dec 24",offerMonth:"2025-11-24",phone:"9823114003",resignationAcceptance:"Done",proposedDOJ:"15th Dec 24",owner:"Nivedita",joiningStatus:"Joined",ctc:500000,statusCode:"Green",notes:"",createdAt:"2025-11-24",updatedAt:"2025-11-24",deleted:false },
  { id:220,sn:220,client:"CMR",designation:"AM Hot refining",location:"Halol",name:"Sativk Sathwara",actualDOJ:"2025-06-16",offerMonth:"2025-05-25",phone:"9106796536",resignationAcceptance:"Complete",proposedDOJ:"2025-06-16",owner:"Shruti",joiningStatus:"Joined",ctc:55000,statusCode:"Red",notes:"",createdAt:"2025-05-25",updatedAt:"2025-05-25",deleted:false },
  { id:201,sn:201,client:"Raghushree Plast",designation:"Crm Executive",location:"Kanpur",name:"Aman Kumar",actualDOJ:"2nd june",offerMonth:"2025-04-25",phone:"9129932688",resignationAcceptance:"Done",proposedDOJ:"2nd June 25",owner:"Shashank",joiningStatus:"Offered",ctc:32000,statusCode:"Red",notes:"",createdAt:"2025-04-25",updatedAt:"2025-04-25",deleted:false },
  { id:202,sn:202,client:"SM Auto",designation:"Company Secretary",location:"Bhoslenagar",name:"Divya Dangi",actualDOJ:"",offerMonth:"2025-05-25",phone:"8767298753",resignationAcceptance:"pending",proposedDOJ:"30 th june",owner:"Pragya",joiningStatus:"Offered",ctc:79000,statusCode:"Red",notes:"",createdAt:"2025-05-25",updatedAt:"2025-05-25",deleted:false },
  { id:203,sn:203,client:"Modern Insulator",designation:"Draftsman",location:"Abu road rajasthan",name:"Aditya Ranjan",actualDOJ:"",offerMonth:"2025-05-25",phone:"9990288250",resignationAcceptance:"pending",proposedDOJ:"1th june 25",owner:"Chandni",joiningStatus:"Backout",ctc:32000,statusCode:"Red",notes:"",createdAt:"2025-05-25",updatedAt:"2025-05-25",deleted:false },
  { id:204,sn:204,client:"SM Auto",designation:"Manager Maintaience",location:"Hosur",name:"Vickneshwaran Tamilmani",actualDOJ:"2025-05-15",offerMonth:"2025-05-25",phone:"9789046707",resignationAcceptance:"Pending",proposedDOJ:"2025-05-15",owner:"Sanjay Sir",joiningStatus:"Joined",ctc:100000,statusCode:"Green",notes:"",createdAt:"2025-05-25",updatedAt:"2025-05-25",deleted:false },
  { id:205,sn:205,client:"M-Safe",designation:"Area Sales Manager",location:"Pune",name:"Sagar Kantilal Devkar",actualDOJ:"2025-06-10",offerMonth:"2025-05-25",phone:"7020814957",resignationAcceptance:"Done",proposedDOJ:"10th June 2025",owner:"Shashank",joiningStatus:"Joined",ctc:58000,statusCode:"Green",notes:"",createdAt:"2025-05-25",updatedAt:"2025-05-25",deleted:false },
  { id:222,sn:222,client:"CMR",designation:"Electrical maintinace",location:"vanod",name:"Narendra",actualDOJ:"2025-07-15",offerMonth:"2025-06-25",phone:"",resignationAcceptance:"Complete",proposedDOJ:"2025-07-15",owner:"Shruti",joiningStatus:"Offered",ctc:53000,statusCode:"Green",notes:"",createdAt:"2025-06-25",updatedAt:"2025-06-25",deleted:false },
  { id:207,sn:207,client:"SM Auto",designation:"Jr. NPD Engineer",location:"Pimpri",name:"Atul Jambukar",actualDOJ:"2025-05-19",offerMonth:"2025-05-25",phone:"9284037835",resignationAcceptance:"Done",proposedDOJ:"2025-05-19",owner:"Abhilasha",joiningStatus:"Joined",ctc:30000,statusCode:"Green",notes:"",createdAt:"2025-05-25",updatedAt:"2025-05-25",deleted:false },
  { id:250,sn:250,client:"CMR",designation:"Mechanical maintaience",location:"vanod",name:"Uday raj singh",actualDOJ:"2025-09-15",offerMonth:"2025-08-25",phone:"6377563386",resignationAcceptance:"pending",proposedDOJ:"2025-09-15",owner:"Shruti",joiningStatus:"Offered",ctc:41500,statusCode:"Green",notes:"",createdAt:"2025-08-25",updatedAt:"2025-08-25",deleted:false },
  { id:209,sn:209,client:"Vista Processed Foods",designation:"Quality officer",location:"Sirhind Punjab",name:"Vivek Singh",actualDOJ:"Doj 1 july 2025",offerMonth:"2025-05-25",phone:"9682061432",resignationAcceptance:"Pending",proposedDOJ:"Doj 1 july 2025",owner:"Chandni",joiningStatus:"Joined",ctc:40000,statusCode:"Green",notes:"",createdAt:"2025-05-25",updatedAt:"2025-05-25",deleted:false },
  { id:210,sn:210,client:"Corob",designation:"Manager HR &IR",location:"Nandigram-Bhilad",name:"Bhavin Parmar",actualDOJ:"15 th july",offerMonth:"2025-05-25",phone:"9662771230",resignationAcceptance:"Pending",proposedDOJ:"23rd July 2025",owner:"Sanjay Sir",joiningStatus:"Offered",ctc:123000,statusCode:"Green",notes:"",createdAt:"2025-05-25",updatedAt:"2025-05-25",deleted:false },
  { id:236,sn:236,client:"CMR",designation:"AM - Maintinace",location:"Pillaipakkam",name:"Ragjapati srivalu",actualDOJ:"2025-09-15",offerMonth:"2025-07-25",phone:"6300186866",resignationAcceptance:"Completed",proposedDOJ:"2025-09-15",owner:"Shruti",joiningStatus:"Offered",ctc:66000,statusCode:"Green",notes:"",createdAt:"2025-07-25",updatedAt:"2025-07-25",deleted:false },
  { id:212,sn:212,client:"Vista Processed Foods",designation:"Packaging  Officer",location:"Mumbai",name:"JYOTI KADAM",actualDOJ:"2025-07-01",offerMonth:"2025-05-25",phone:"9167374704",resignationAcceptance:"Pending",proposedDOJ:"30th June  2025",owner:"Shashank",joiningStatus:"Offered",ctc:44000,statusCode:"Red",notes:"",createdAt:"2025-05-25",updatedAt:"2025-05-25",deleted:false },
  { id:213,sn:213,client:"Vista Processed Foods",designation:"Deputy manager NPD",location:"Mumbai",name:"Vishal Shahare",actualDOJ:"",offerMonth:"2025-05-25",phone:"7674912130",resignationAcceptance:"Pending",proposedDOJ:"DOJ - 5th July  2025",owner:"Chandni",joiningStatus:"Offered",ctc:85000,statusCode:"Red",notes:"",createdAt:"2025-05-25",updatedAt:"2025-05-25",deleted:false },
  { id:214,sn:214,client:"Suspa",designation:"HR Manager",location:"Gujarat",name:"Krishna Kaushik",actualDOJ:"2025-06-26",offerMonth:"2025-05-25",phone:"8825800153",resignationAcceptance:"Pending",proposedDOJ:"2025-06-27",owner:"Chandni",joiningStatus:"Joined",ctc:66000,statusCode:"Green",notes:"",createdAt:"2025-05-25",updatedAt:"2025-05-25",deleted:false },
  { id:215,sn:215,client:"Vista Processed Foods",designation:"Quality officer",location:"Sirhind",name:"Divya lalwani",actualDOJ:"",offerMonth:"2025-05-25",phone:"9079029060",resignationAcceptance:"",proposedDOJ:"2025-07-28",owner:"Chandni",joiningStatus:"Offered",ctc:44166,statusCode:"Red",notes:"",createdAt:"2025-05-25",updatedAt:"2025-05-25",deleted:false },
  { id:216,sn:216,client:"Zytex",designation:"Data analysis",location:"Mumbai",name:"Mahesh Ambedker",actualDOJ:"1 st july",offerMonth:"2025-05-25",phone:"7972935763",resignationAcceptance:"pending",proposedDOJ:"1 st july",owner:"Ample Leap",joiningStatus:"Joined",ctc:64166,statusCode:"Green",notes:"",createdAt:"2025-05-25",updatedAt:"2025-05-25",deleted:false },
  { id:252,sn:252,client:"CMR",designation:"Quality",location:"Vanod Gujarat",name:"Shiv Saini",actualDOJ:"2025-10-01",offerMonth:"2025-08-25",phone:"8385891101",resignationAcceptance:"pending",proposedDOJ:"2025-10-01",owner:"Shruti",joiningStatus:"Offered",ctc:41000,statusCode:"Green",notes:"",createdAt:"2025-08-25",updatedAt:"2025-08-25",deleted:false },
  { id:218,sn:218,client:"Urja Global",designation:"Business devlopment Manager",location:"punjab",name:"Vikas Attaray",actualDOJ:"2025-06-17",offerMonth:"2025-05-25",phone:"9991639314",resignationAcceptance:"Hard copy resignation Acceptance in process",proposedDOJ:"2025-06-07",owner:"Anshika",joiningStatus:"Offered",ctc:55555,statusCode:"Red",notes:"",createdAt:"2025-05-25",updatedAt:"2025-05-25",deleted:false },
  { id:219,sn:219,client:"Metal Seam",designation:"Quality executive",location:"Lucknow",name:"Prince Mishra",actualDOJ:"",offerMonth:"2025-05-25",phone:"91895795548",resignationAcceptance:"Resignation Acceptance pending",proposedDOJ:"2025-06-30",owner:"Chandni",joiningStatus:"Offered",ctc:23333,statusCode:"Red",notes:"",createdAt:"2025-05-25",updatedAt:"2025-05-25",deleted:false },
  { id:221,sn:221,client:"FIL Industries",designation:"International Business",location:"Delhi",name:"Shahid chaudhary",actualDOJ:"2 nd july",offerMonth:"2025-05-25",phone:"9899830831",resignationAcceptance:"Resignation Acceptance pending",proposedDOJ:"2 nd july",owner:"Pallavi",joiningStatus:"Joined",ctc:162500,statusCode:"Green",notes:"",createdAt:"2025-05-25",updatedAt:"2025-05-25",deleted:false },
  { id:222,sn:222,client:"Vista Processed Foods",designation:"Legal executive",location:"Munbai",name:"Abhishek updhaya",actualDOJ:"",offerMonth:"2025-05-25",phone:"7977843595",resignationAcceptance:"pending",proposedDOJ:"9 th june",owner:"Pragya",joiningStatus:"Offered",ctc:333333,statusCode:"Red",notes:"",createdAt:"2025-05-25",updatedAt:"2025-05-25",deleted:false },
  { id:223,sn:223,client:"SM Auto",designation:"jr. engineer Electrical Maintaience",location:"Pimpri",name:"Kuldeep bamberwal",actualDOJ:"19 th june",offerMonth:"2025-05-25",phone:"7976682138",resignationAcceptance:"pending",proposedDOJ:"16 th june",owner:"Pragya",joiningStatus:"Joined",ctc:30000,statusCode:"Green",notes:"",createdAt:"2025-05-25",updatedAt:"2025-05-25",deleted:false },
  { id:253,sn:253,client:"CMR",designation:"Hot refining",location:"Tirupati",name:"Rebba kiranbabu",actualDOJ:"2025-10-06",offerMonth:"2025-08-25",phone:"8977877449",resignationAcceptance:"pending",proposedDOJ:"2025-10-06",owner:"Shruti",joiningStatus:"Offered",ctc:50000,statusCode:"Green",notes:"",createdAt:"2025-08-25",updatedAt:"2025-08-25",deleted:false },
  { id:274,sn:274,client:"CMR",designation:"Business excellence",location:"Sriperambadur",name:"ravikant kumar",actualDOJ:"2025-11-03",offerMonth:"2025-10-25",phone:"9877386179",resignationAcceptance:"Completed",proposedDOJ:"2025-11-03",owner:"Shruti",joiningStatus:"Offered",ctc:54000,statusCode:"Red",notes:"",createdAt:"2025-10-25",updatedAt:"2025-10-25",deleted:false },
  { id:223,sn:223,client:"Urja Global",designation:"Sales Manager",location:"Maharastra",name:"Sanmesh Bhalerao",actualDOJ:"2025-06-16",offerMonth:"2025-06-25",phone:"8689829198",resignationAcceptance:"complete",proposedDOJ:"2025-06-16",owner:"Sanjay Sir",joiningStatus:"Offered",ctc:94000,statusCode:"Red",notes:"",createdAt:"2025-06-25",updatedAt:"2025-06-25",deleted:false },
  { id:224,sn:224,client:"SM Auto",designation:"Simulation engineer",location:"Pune",name:"Ankit Bhukele",actualDOJ:"",offerMonth:"2025-06-25",phone:"9172508894",resignationAcceptance:"complete",proposedDOJ:"1 st july",owner:"Chandni",joiningStatus:"Offered",ctc:58000,statusCode:"Red",notes:"",createdAt:"2025-06-25",updatedAt:"2025-06-25",deleted:false },
  { id:225,sn:225,client:"Vista Processed Foods",designation:"Legal executive",location:"Pune",name:"Tanmay Gujrati",actualDOJ:"2025-06-23",offerMonth:"2025-06-25",phone:"7045873506",resignationAcceptance:"complete",proposedDOJ:"2025-06-23",owner:"Sanjay Sir",joiningStatus:"Joined",ctc:40000,statusCode:"Green",notes:"",createdAt:"2025-06-25",updatedAt:"2025-06-25",deleted:false },
  { id:226,sn:226,client:"Modern Metalcast Limited",designation:"production Manager",location:"Ahemdabad",name:"Deepak Kumar",actualDOJ:"",offerMonth:"2025-06-25",phone:"9911342555",resignationAcceptance:"complete",proposedDOJ:"5 th July",owner:"Anshika",joiningStatus:"Offered",ctc:150000,statusCode:"Red",notes:"",createdAt:"2025-06-25",updatedAt:"2025-06-25",deleted:false },
  { id:227,sn:227,client:"Vivo",designation:"PQE",location:"Noida",name:"Manjeet yadav",actualDOJ:"2025-07-04",offerMonth:"2025-06-25",phone:"8178554670",resignationAcceptance:"Resignation Acceptance pending",proposedDOJ:"4 th July",owner:"Chandni",joiningStatus:"Joined",ctc:41000,statusCode:"Green",notes:"",createdAt:"2025-06-25",updatedAt:"2025-06-25",deleted:false },
  { id:228,sn:228,client:"Corob",designation:"Quality inspector",location:"Bhilad",name:"Anshul gupta",actualDOJ:"2025-07-21",offerMonth:"2025-06-25",phone:"9889757885",resignationAcceptance:"complete",proposedDOJ:"2025-07-21",owner:"Chandni",joiningStatus:"Offered",ctc:35000,statusCode:"Green",notes:"",createdAt:"2025-06-25",updatedAt:"2025-06-25",deleted:false },
  { id:263,sn:263,client:"CMR",designation:"BE",location:"Tatrpur",name:"Amogh",actualDOJ:"2025-11-03",offerMonth:"2025-09-25",phone:"8130881595",resignationAcceptance:"pending",proposedDOJ:"3rd nov",owner:"Shruti",joiningStatus:"Joined",ctc:60000,statusCode:"Green",notes:"",createdAt:"2025-09-25",updatedAt:"2025-09-25",deleted:false },
  { id:230,sn:230,client:"Vista Processed Foods",designation:"Quality",location:"Sirhind",name:"Naina Gupta",actualDOJ:"2025-07-18",offerMonth:"2025-06-25",phone:"9877183970",resignationAcceptance:"pending",proposedDOJ:"2025-07-18",owner:"Chandni",joiningStatus:"Offered",ctc:38000,statusCode:"Green",notes:"",createdAt:"2025-06-25",updatedAt:"2025-06-25",deleted:false },
  { id:251,sn:251,client:"CMR",designation:"Hot refining",location:"vanod",name:"Animesh G tamrakar",actualDOJ:"2025-11-03",offerMonth:"2025-08-25",phone:"8899075457",resignationAcceptance:"pendig",proposedDOJ:"1 st oct",owner:"Shruti",joiningStatus:"Joined",ctc:54000,statusCode:"Green",notes:"",createdAt:"2025-08-25",updatedAt:"2025-08-25",deleted:false },
  { id:232,sn:232,client:"Vivo",designation:"ODM quality",location:"Noida",name:"Shubham Jain",actualDOJ:"2025-08-11",offerMonth:"2025-06-25",phone:"9621346044",resignationAcceptance:"Pending",proposedDOJ:"DOJ - 11 Aug 2025",owner:"Chandni",joiningStatus:"Offered",ctc:45000,statusCode:"Green",notes:"",createdAt:"2025-06-25",updatedAt:"2025-06-25",deleted:false },
  { id:234,sn:234,client:"Vista Processed Foods",designation:"Packaging  Officer",location:"Sirhind Punjab",name:"Prashant Ranjan",actualDOJ:"2025-08-06",offerMonth:"2025-06-25",phone:"8968338320",resignationAcceptance:"Pending",proposedDOJ:"DOJ - 6 Aug  2025",owner:"Chandni",joiningStatus:"Offered",ctc:36000,statusCode:"Green",notes:"",createdAt:"2025-06-25",updatedAt:"2025-06-25",deleted:false },
  { id:273,sn:273,client:"CMR",designation:"Business excellence",location:"Sriperambadur",name:"Vignesh",actualDOJ:"2025-11-17",offerMonth:"2025-10-25",phone:"9789616859",resignationAcceptance:"completed",proposedDOJ:"2025-11-17",owner:"Shruti",joiningStatus:"Joined",ctc:50000,statusCode:"Green",notes:"",createdAt:"2025-10-25",updatedAt:"2025-10-25",deleted:false },
  { id:284,sn:284,client:"CMR",designation:"AM - HR",location:"Vanod Gujarat",name:"jitendra barot",actualDOJ:"2025-12-15",offerMonth:"2025-11-25",phone:"9727772883",resignationAcceptance:"Pendng",proposedDOJ:"2026-12-05",owner:"Pallavi",joiningStatus:"Joined",ctc:83000,statusCode:"Green",notes:"",createdAt:"2025-11-25",updatedAt:"2025-11-25",deleted:false },
  { id:307,sn:307,client:"CMR",designation:"Dispatch Executive",location:"Bawal",name:"Sunil Panchal",actualDOJ:"2026-01-05",offerMonth:"2025-12-25",phone:"7572802223",resignationAcceptance:"Completed",proposedDOJ:"1st  jan",owner:"Akshat",joiningStatus:"Joined",ctc:45000,statusCode:"Red",notes:"",createdAt:"2025-12-25",updatedAt:"2025-12-25",deleted:false },
  { id:238,sn:238,client:"Arkelite",designation:"ASM",location:"Uttrakhand",name:"Kapil kumar chauhan",actualDOJ:"8th sep",offerMonth:"2025-07-25",phone:"9569631016",resignationAcceptance:"Completed",proposedDOJ:"2025-09-08",owner:"Shashank",joiningStatus:"Offered",ctc:71000,statusCode:"Red",notes:"",createdAt:"2025-07-25",updatedAt:"2025-07-25",deleted:false },
  { id:239,sn:239,client:"SM Auto",designation:"Exim executive",location:"Pune",name:"Vishal datta",actualDOJ:"",offerMonth:"2025-07-25",phone:"",resignationAcceptance:"Pending",proposedDOJ:"",owner:"Harshita",joiningStatus:"Offered",ctc:40000,statusCode:"Red",notes:"",createdAt:"2025-07-25",updatedAt:"2025-07-25",deleted:false },
  { id:240,sn:240,client:"Metal Seam",designation:"Business execllence Manager",location:"Lucknow",name:"Shailendra",actualDOJ:"2025-08-08",offerMonth:"2025-07-25",phone:"8810881430",resignationAcceptance:"Pending",proposedDOJ:"2025-08-08",owner:"Nivedita",joiningStatus:"Offered",ctc:125000,statusCode:"Green",notes:"",createdAt:"2025-07-25",updatedAt:"2025-07-25",deleted:false },
  { id:241,sn:241,client:"Vivo",designation:"finance Manager",location:"G. noida",name:"Dayal",actualDOJ:"2025-09-22",offerMonth:"2025-07-25",phone:"9999036406",resignationAcceptance:"Completed",proposedDOJ:"2025-09-22",owner:"Nivedita",joiningStatus:"Offered",ctc:135000,statusCode:"Green",notes:"",createdAt:"2025-07-25",updatedAt:"2025-07-25",deleted:false },
  { id:242,sn:242,client:"Modern Insulator",designation:"Quality Head",location:"Sanand",name:"Rajesh",actualDOJ:"2025-10-01",offerMonth:"2025-07-25",phone:"8368218714",resignationAcceptance:"pending",proposedDOJ:"2025-10-01",owner:"Chandni",joiningStatus:"Offered",ctc:167000,statusCode:"Red",notes:"",createdAt:"2025-07-25",updatedAt:"2025-07-25",deleted:false },
  { id:243,sn:243,client:"Vivo",designation:"Assembly production engineer",location:"G.noida",name:"joginder Thakur",actualDOJ:"1 st sep",offerMonth:"2025-07-25",phone:"8894601531",resignationAcceptance:"Completed",proposedDOJ:"2025-09-01",owner:"Harshita",joiningStatus:"Offered",ctc:64000,statusCode:"Green",notes:"",createdAt:"2025-07-25",updatedAt:"2025-07-25",deleted:false },
  { id:244,sn:244,client:"BBD",designation:"AGM Sales",location:"Lucknow",name:"Ankur Batra",actualDOJ:"2025-08-18",offerMonth:"2025-07-25",phone:"8081397776",resignationAcceptance:"pending",proposedDOJ:"2025-08-18",owner:"Vaisnavi",joiningStatus:"Offered",ctc:110000,statusCode:"Green",notes:"",createdAt:"2025-07-25",updatedAt:"2025-07-25",deleted:false },
  { id:245,sn:245,client:"Vivo",designation:"production engineer",location:"G.noida",name:"Dinanath",actualDOJ:"",offerMonth:"2025-07-25",phone:"6381934105",resignationAcceptance:"pending",proposedDOJ:"8 th Sep",owner:"Chandni",joiningStatus:"Offered",ctc:50000,statusCode:"Red",notes:"",createdAt:"2025-07-25",updatedAt:"2025-07-25",deleted:false },
  { id:246,sn:246,client:"Arkelite",designation:"ASM",location:"Gwalior",name:"Kanti kumar Asthana",actualDOJ:"2025-09-01",offerMonth:"2025-08-25",phone:"9926456750",resignationAcceptance:"pending",proposedDOJ:"2025-08-25",owner:"Prachi",joiningStatus:"Offered",ctc:44000,statusCode:"Red",notes:"",createdAt:"2025-08-25",updatedAt:"2025-08-25",deleted:false },
  { id:247,sn:247,client:"Metal Seam",designation:"Senior Manager Maintinance",location:"Lucknow",name:"Rajesh",actualDOJ:"2025-09-20",offerMonth:"2025-08-25",phone:"9729791697",resignationAcceptance:"pending",proposedDOJ:"2025-09-20",owner:"Chandni",joiningStatus:"Joined",ctc:100000,statusCode:"Green",notes:"",createdAt:"2025-08-25",updatedAt:"2025-08-25",deleted:false },
  { id:248,sn:248,client:"Payal Group",designation:"Plant manager",location:"Dahej",name:"Rohit",actualDOJ:"2025-10-20",offerMonth:"2025-08-25",phone:"8923133133",resignationAcceptance:"pending",proposedDOJ:"2025-10-20",owner:"Vaisnavi",joiningStatus:"Joined",ctc:135000,statusCode:"Green",notes:"",createdAt:"2025-08-25",updatedAt:"2025-08-25",deleted:false },
  { id:249,sn:249,client:"Metal Seam",designation:"QMS Manager",location:"Lucknow",name:"Saurabh Singh",actualDOJ:"",offerMonth:"2025-08-25",phone:"8800945192",resignationAcceptance:"pending",proposedDOJ:"2025-09-09",owner:"Shruti",joiningStatus:"Offered",ctc:100000,statusCode:"Red",notes:"",createdAt:"2025-08-25",updatedAt:"2025-08-25",deleted:false },
  { id:320,sn:320,client:"CMR",designation:"Dispatch",location:"Manesar",name:"Ajay sharma",actualDOJ:"2026-01-05",offerMonth:"2025-12-25",phone:"9416846371",resignationAcceptance:"Pending",proposedDOJ:"2025-01-05",owner:"Akshat",joiningStatus:"Joined",ctc:55000,statusCode:"Green",notes:"",createdAt:"2025-12-25",updatedAt:"2025-12-25",deleted:false },
  { id:321,sn:321,client:"CMR",designation:"AM - Business excellence",location:"Manesar",name:"Shashank",actualDOJ:"2026-01-05",offerMonth:"2025-12-25",phone:"9996602250",resignationAcceptance:"Pending",proposedDOJ:"2025-01-01",owner:"Ample Leap",joiningStatus:"Joined",ctc:55000,statusCode:"Green",notes:"",createdAt:"2025-12-25",updatedAt:"2025-12-25",deleted:false },
  { id:293,sn:293,client:"CMR",designation:"Hot refining",location:"Haridwar",name:"Himanshu dahiya",actualDOJ:"2026-01-05",offerMonth:"2025-11-25",phone:"\u202a8684860596",resignationAcceptance:"pending",proposedDOJ:"1 st jan",owner:"Sanjay Sir",joiningStatus:"Joined",ctc:52000,statusCode:"Green",notes:"",createdAt:"2025-11-25",updatedAt:"2025-11-25",deleted:false },
  { id:278,sn:278,client:"CMR",designation:"QC",location:"Pilaipakam",name:"Natrajan",actualDOJ:"2026-01-05",offerMonth:"2025-10-25",phone:"7092486757",resignationAcceptance:"completed",proposedDOJ:"2025-01-05",owner:"Akshat",joiningStatus:"Joined",ctc:40000,statusCode:"Green",notes:"",createdAt:"2025-10-25",updatedAt:"2025-10-25",deleted:false },
  { id:308,sn:308,client:"CMR",designation:"Hot refining",location:"Gujrat",name:"Ravikant Yadav",actualDOJ:"",offerMonth:"2025-12-25",phone:"8949849438",resignationAcceptance:"pending",proposedDOJ:"2025-01-05",owner:"Ample Leap",joiningStatus:"Offered",ctc:45000,statusCode:"Red",notes:"",createdAt:"2025-12-25",updatedAt:"2025-12-25",deleted:false },
  { id:255,sn:255,client:"Vivo",designation:"Accounts",location:"G.noida",name:"Deepak gorai",actualDOJ:"3 rd oct",offerMonth:"2025-09-25",phone:"6201951841",resignationAcceptance:"Complete",proposedDOJ:"5th oct",owner:"Ample Leap",joiningStatus:"Joined",ctc:45000,statusCode:"Green",notes:"",createdAt:"2025-09-25",updatedAt:"2025-09-25",deleted:false },
  { id:256,sn:256,client:"Metal Seam",designation:"Hr Manager",location:"Lucknow",name:"Asheesh Shukla",actualDOJ:"1 st oct",offerMonth:"2025-09-25",phone:"",resignationAcceptance:"Complete",proposedDOJ:"1st oct",owner:"Nivedita",joiningStatus:"Joined",ctc:91000,statusCode:"Green",notes:"",createdAt:"2025-09-25",updatedAt:"2025-09-25",deleted:false },
  { id:257,sn:257,client:"Metal Seam",designation:"HR Manager",location:"Lucknow",name:"Rahul Kumar",actualDOJ:"22nd sep 25",offerMonth:"2025-09-25",phone:"9835474287",resignationAcceptance:"Complete",proposedDOJ:"2025-09-22",owner:"Nivedita",joiningStatus:"Joined",ctc:100000,statusCode:"Green",notes:"",createdAt:"2025-09-25",updatedAt:"2025-09-25",deleted:false },
  { id:324,sn:324,client:"CMR",designation:"Head - hot refining",location:"Tirupati",name:"Amit kumar pandey",actualDOJ:"16 th Jan",offerMonth:"2025-12-25",phone:"7988062081",resignationAcceptance:"Completed",proposedDOJ:"16 th jan",owner:"Pallavi",joiningStatus:"Offered",ctc:150000,statusCode:"Green",notes:"",createdAt:"2025-12-25",updatedAt:"2025-12-25",deleted:false },
  { id:259,sn:259,client:"Modern Insulator",designation:"HR manager",location:"Abu Rod",name:"Anirudh Gautam",actualDOJ:"",offerMonth:"2025-09-25",phone:"6367036722",resignationAcceptance:"pending",proposedDOJ:"2025-11-10",owner:"Ample Leap",joiningStatus:"Offered",ctc:150000,statusCode:"Red",notes:"",createdAt:"2025-09-25",updatedAt:"2025-09-25",deleted:false },
  { id:260,sn:260,client:"Elofic Industries",designation:"Quality executive",location:"Nalagarh",name:"Rakesh kumar",actualDOJ:"1 st oct",offerMonth:"2025-09-25",phone:"8826984988",resignationAcceptance:"Complete",proposedDOJ:"2025-10-01",owner:"Chandni",joiningStatus:"Offered",ctc:44000,statusCode:"Green",notes:"",createdAt:"2025-09-25",updatedAt:"2025-09-25",deleted:false },
  { id:327,sn:327,client:"CMR",designation:"Dispatch",location:"Gujrat",name:"Jogaji rathod",actualDOJ:"2026-01-15",offerMonth:"2025-12-25",phone:"7201978076",resignationAcceptance:"Completed",proposedDOJ:"2026-01-15",owner:"Karishma",joiningStatus:"Joined",ctc:37000,statusCode:"Green",notes:"",createdAt:"2025-12-25",updatedAt:"2025-12-25",deleted:false },
  { id:262,sn:262,client:"NRB Bearing",designation:"Sales engineer",location:"MP",name:"Chandrakant",actualDOJ:"7 th Nov",offerMonth:"2025-09-25",phone:"9691258231",resignationAcceptance:"pending",proposedDOJ:"10 th nov",owner:"Chandni",joiningStatus:"Joined",ctc:60000,statusCode:"Green",notes:"",createdAt:"2025-09-25",updatedAt:"2025-09-25",deleted:false },
  { id:316,sn:316,client:"CMR",designation:"Business excellence",location:"Bawal",name:"Arpit Kumar",actualDOJ:"2026-01-15",offerMonth:"2025-12-25",phone:"7905731568",resignationAcceptance:"pending",proposedDOJ:"2025-01-15",owner:"Akshat",joiningStatus:"Joined",ctc:54000,statusCode:"Red",notes:"",createdAt:"2025-12-25",updatedAt:"2025-12-25",deleted:false },
  { id:264,sn:264,client:"Ananda Balaji",designation:"Store",location:"Khargoan",name:"Anil",actualDOJ:"2025-11-01",offerMonth:"2025-09-25",phone:"",resignationAcceptance:"complete",proposedDOJ:"2025-11-01",owner:"Abhay",joiningStatus:"Joined",ctc:20000,statusCode:"Green",notes:"",createdAt:"2025-09-25",updatedAt:"2025-09-25",deleted:false },
  { id:265,sn:265,client:"Zuari",designation:"Sales manager",location:"krishnagiri",name:"Mullaivendhan D",actualDOJ:"6 Th Oct",offerMonth:"2025-09-25",phone:"9442151292",resignationAcceptance:"complete",proposedDOJ:"6 th oct",owner:"Chandni",joiningStatus:"Offered",ctc:100000,statusCode:"Green",notes:"",createdAt:"2025-09-25",updatedAt:"2025-09-25",deleted:false },
  { id:266,sn:266,client:"Zuari",designation:"PA",location:"Banglore",name:"Danhush CG",actualDOJ:"7 th nov",offerMonth:"2025-09-25",phone:"8489234201",resignationAcceptance:"pending",proposedDOJ:"7th Nov",owner:"Chandni",joiningStatus:"Joined",ctc:45000,statusCode:"Red",notes:"",createdAt:"2025-09-25",updatedAt:"2025-09-25",deleted:false },
  { id:267,sn:267,client:"JSW",designation:"Safty officer",location:"Solapur",name:"Abhishek rout",actualDOJ:"",offerMonth:"2025-09-25",phone:"8637257025",resignationAcceptance:"pending",proposedDOJ:"2025-10-20",owner:"Sanjay Sir",joiningStatus:"Offered",ctc:50000,statusCode:"Red",notes:"",createdAt:"2025-09-25",updatedAt:"2025-09-25",deleted:false },
  { id:268,sn:268,client:"Zytex",designation:"Technical Sales",location:"Karnal",name:"Ashutosh Bharadwaj",actualDOJ:"",offerMonth:"2025-10-25",phone:"7027272345",resignationAcceptance:"pending",proposedDOJ:"2025-11-06",owner:"Harshita",joiningStatus:"Offered",ctc:64000,statusCode:"Red",notes:"",createdAt:"2025-10-25",updatedAt:"2025-10-25",deleted:false },
  { id:269,sn:269,client:"Metal Seam",designation:"CRM",location:"Lucknow",name:"Ayush tyagi",actualDOJ:"2025-10-11",offerMonth:"2025-10-25",phone:"8081743423",resignationAcceptance:"completed",proposedDOJ:"2025-10-11",owner:"Chandni",joiningStatus:"Joined",ctc:15000,statusCode:"Green",notes:"",createdAt:"2025-10-25",updatedAt:"2025-10-25",deleted:false },
  { id:270,sn:270,client:"Vista Processed Foods",designation:"Qa officer",location:"Sirhind",name:"Suraj bist",actualDOJ:"",offerMonth:"2025-10-25",phone:"6395533525",resignationAcceptance:"Completed",proposedDOJ:"2025-11-03",owner:"Harshita",joiningStatus:"Offered",ctc:32000,statusCode:"Red",notes:"",createdAt:"2025-10-25",updatedAt:"2025-10-25",deleted:false },
  { id:271,sn:271,client:"Metal Seam",designation:"QMS coordinator",location:"Lucknow",name:"Sandeep kumar",actualDOJ:"2025-11-10",offerMonth:"2025-10-25",phone:"8948503215",resignationAcceptance:"Competed",proposedDOJ:"2025-11-10",owner:"Shruti",joiningStatus:"Joined",ctc:48000,statusCode:"Green",notes:"",createdAt:"2025-10-25",updatedAt:"2025-10-25",deleted:false },
  { id:272,sn:272,client:"Pocl",designation:"Accounts executive",location:"Gujrat",name:"Anil bhai",actualDOJ:"",offerMonth:"0ct -25",phone:"",resignationAcceptance:"Pending",proposedDOJ:"2025-11-05",owner:"Ayush",joiningStatus:"Offered",ctc:32000,statusCode:"Red",notes:"",createdAt:"2024-01-01",updatedAt:"2024-01-01",deleted:false },
  { id:296,sn:296,client:"CMR",designation:"BE",location:"Halol",name:"Chandra Sribvastava",actualDOJ:"2026-01-15",offerMonth:"2025-11-25",phone:"8770612085",resignationAcceptance:"Pending",proposedDOJ:"2026-01-15",owner:"Ample Leap",joiningStatus:"Joined",ctc:50000,statusCode:"Green",notes:"",createdAt:"2025-11-25",updatedAt:"2025-11-25",deleted:false },
  { id:313,sn:313,client:"CMR",designation:"Cold refining",location:"Tirupati",name:"Manoj V. dibbadamani",actualDOJ:"6 th March",offerMonth:"2025-12-25",phone:"7259404716",resignationAcceptance:"Pending",proposedDOJ:"2026-03-06",owner:"Akshat",joiningStatus:"Offered",ctc:50000,statusCode:"Yellow",notes:"",createdAt:"2025-12-25",updatedAt:"2025-12-25",deleted:false },
  { id:275,sn:275,client:"Pocl",designation:"Senior Store executive",location:"Kosamba",name:"Ashutosh dubey",actualDOJ:"2025-11-17",offerMonth:"2025-10-25",phone:"9321704198",resignationAcceptance:"Completed",proposedDOJ:"2025-11-15",owner:"Chandni",joiningStatus:"Offered",ctc:45000,statusCode:"Red",notes:"",createdAt:"2025-10-25",updatedAt:"2025-10-25",deleted:false },
  { id:276,sn:276,client:"Metal Seam",designation:"EHS",location:"Lucknow",name:"Sourabh yadav",actualDOJ:"2025-12-08",offerMonth:"2025-10-25",phone:"7891361258",resignationAcceptance:"completed",proposedDOJ:"2025-12-07",owner:"Harshita",joiningStatus:"Joined",ctc:70000,statusCode:"Green",notes:"",createdAt:"2025-10-25",updatedAt:"2025-10-25",deleted:false },
  { id:229,sn:229,client:"CMR",designation:"Quality",location:"Halol",name:"Vinay kumar mishra",actualDOJ:"15 th july",offerMonth:"2025-06-25",phone:"8934932393",resignationAcceptance:"pending",proposedDOJ:"2025-07-21",owner:"Shruti",joiningStatus:"Offered",ctc:54000,statusCode:"Green",notes:"",createdAt:"2025-06-25",updatedAt:"2025-06-25",deleted:false },
  { id:279,sn:279,client:"Suspa",designation:"Sr.sales manager",location:"chennai",name:"Arivend B. jacks",actualDOJ:"2026-02-04",offerMonth:"2025-10-25",phone:"9843428289",resignationAcceptance:"pending",proposedDOJ:"2026-02-01",owner:"Sameer Sir",joiningStatus:"Offered",ctc:240000,statusCode:"Green",notes:"",createdAt:"2025-10-25",updatedAt:"2025-10-25",deleted:false },
  { id:280,sn:280,client:"Metal Seam",designation:"Internal Auditor",location:"Lucknow",name:"Ayush gupta",actualDOJ:"2025-11-10",offerMonth:"2025-10-25",phone:"9453580045",resignationAcceptance:"completed",proposedDOJ:"2025-11-10",owner:"Nivedita",joiningStatus:"Joined",ctc:55000,statusCode:"Green",notes:"",createdAt:"2025-10-25",updatedAt:"2025-10-25",deleted:false },
  { id:281,sn:281,client:"Metal Seam",designation:"Mis executive",location:"Lucknow",name:"Akhil gupata",actualDOJ:"2025-11-03",offerMonth:"2025-10-25",phone:"7985922092",resignationAcceptance:"Completed",proposedDOJ:"3 rd nov",owner:"Ayush",joiningStatus:"Joined",ctc:22000,statusCode:"Green",notes:"",createdAt:"2025-10-25",updatedAt:"2025-10-25",deleted:false },
  { id:282,sn:282,client:"QGS",designation:"Tele sales executive",location:"Delhi",name:"Surabhi taneja",actualDOJ:"2025-11-01",offerMonth:"2025-10-25",phone:"9988246969",resignationAcceptance:"completed",proposedDOJ:"2025-11-01",owner:"Ample Leap",joiningStatus:"Joined",ctc:45000,statusCode:"Green",notes:"",createdAt:"2025-10-25",updatedAt:"2025-10-25",deleted:false },
  { id:237,sn:237,client:"CMR",designation:"AM - cold refining",location:"Vanod Gujarat",name:"Hemendra",actualDOJ:"18th Aug",offerMonth:"2025-07-25",phone:"9928710459",resignationAcceptance:"Pending",proposedDOJ:"18th Aug",owner:"Shruti",joiningStatus:"Offered",ctc:41000,statusCode:"Red",notes:"",createdAt:"2025-07-25",updatedAt:"2025-07-25",deleted:false },
  { id:206,sn:206,client:"CMR",designation:"Plant head",location:"Chennai",name:"Sri N Rajan",actualDOJ:"1st july",offerMonth:"2025-05-25",phone:"9659849288",resignationAcceptance:"Pending",proposedDOJ:"1st AUG 2025",owner:"Pallavi",joiningStatus:"Joined",ctc:250000,statusCode:"Green",notes:"",createdAt:"2025-05-25",updatedAt:"2025-05-25",deleted:false },
  { id:285,sn:285,client:"Vista Processed Foods",designation:"Am Quality",location:"Mumbai",name:"Karunesh Pandey",actualDOJ:"2025-12-15",offerMonth:"2025-11-25",phone:"7709581152",resignationAcceptance:"completed",proposedDOJ:"2025-12-15",owner:"Chandni",joiningStatus:"Joined",ctc:84000,statusCode:"Green",notes:"",createdAt:"2025-11-25",updatedAt:"2025-11-25",deleted:false },
  { id:286,sn:286,client:"Metal Seam",designation:"Am QMS",location:"Lucknow",name:"Amresh",actualDOJ:"2025-12-15",offerMonth:"2025-11-25",phone:"8887562414",resignationAcceptance:"pending",proposedDOJ:"2025-12-15",owner:"Chandni",joiningStatus:"Joined",ctc:58000,statusCode:"Green",notes:"",createdAt:"2025-11-25",updatedAt:"2025-11-25",deleted:false },
  { id:287,sn:287,client:"Skylark Food",designation:"Manager purchase",location:"Sonipat",name:"Manpreet Singh",actualDOJ:"",offerMonth:"2025-11-25",phone:"7009286586",resignationAcceptance:"pending",proposedDOJ:"2025-12-11",owner:"Abhay",joiningStatus:"Backout",ctc:70000,statusCode:"Red",notes:"",createdAt:"2025-11-25",updatedAt:"2025-11-25",deleted:false },
  { id:288,sn:288,client:"Shailmar",designation:"Finance & Accounts",location:"Lucknow",name:"Ravi",actualDOJ:"2025-12-01",offerMonth:"2025-11-25",phone:"8368937785",resignationAcceptance:"pending",proposedDOJ:"2025-12-01",owner:"Nivedita",joiningStatus:"Joined",ctc:51000,statusCode:"Red",notes:"",createdAt:"2025-11-25",updatedAt:"2025-11-25",deleted:false },
  { id:289,sn:289,client:"Gyandhara",designation:"content writer",location:"Lucknow",name:"Om Sachan",actualDOJ:"2025-12-05",offerMonth:"2025-11-25",phone:"8181843889",resignationAcceptance:"completed",proposedDOJ:"2025-12-05",owner:"Harshita",joiningStatus:"Joined",ctc:22000,statusCode:"Green",notes:"",createdAt:"2025-11-25",updatedAt:"2025-11-25",deleted:false },
  { id:290,sn:290,client:"Zytex",designation:"Business devlopment Manager",location:"Tripur",name:"Suresh",actualDOJ:"2025-12-16",offerMonth:"2025-11-25",phone:"9942167475",resignationAcceptance:"pending",proposedDOJ:"2025-12-16",owner:"Chandni",joiningStatus:"Joined",ctc:125000,statusCode:"Green",notes:"",createdAt:"2025-11-25",updatedAt:"2025-11-25",deleted:false },
  { id:291,sn:291,client:"SM Auto",designation:"Exim Manager",location:"Pune",name:"Kamlesh Bhalerao",actualDOJ:"2025-12-15",offerMonth:"2025-11-25",phone:"7498021061",resignationAcceptance:"pending",proposedDOJ:"2025-12-15",owner:"Sanjay Sir",joiningStatus:"Offered",ctc:95000,statusCode:"Red",notes:"",createdAt:"2025-11-25",updatedAt:"2025-11-25",deleted:false },
  { id:292,sn:292,client:"Urja Global",designation:"SCM",location:"Delhi",name:"Amit",actualDOJ:"2025-12-17",offerMonth:"2025-11-25",phone:"9711850424",resignationAcceptance:"Pending",proposedDOJ:"2025-12-16",owner:"Harshita",joiningStatus:"Joined",ctc:50000,statusCode:"Red",notes:"",createdAt:"2025-11-25",updatedAt:"2025-11-25",deleted:false },
  { id:200,sn:200,client:"CMR",designation:"AM Dispatch",location:"Manesar",name:"Sunil",actualDOJ:"2 nd june",offerMonth:"2025-04-25",phone:"8814919544",resignationAcceptance:"Done",proposedDOJ:"2nd June 25",owner:"Nivedita",joiningStatus:"Offered",ctc:58000,statusCode:"Green",notes:"",createdAt:"2025-04-25",updatedAt:"2025-04-25",deleted:false },
  { id:294,sn:294,client:"SM Auto",designation:"Officer HR & admin",location:"Pimpari",name:"Sanket khalate",actualDOJ:"24 th Nov",offerMonth:"2025-11-25",phone:"9423001000",resignationAcceptance:"completed",proposedDOJ:"2025-11-24",owner:"Sanjay Sir",joiningStatus:"Backout",ctc:30000,statusCode:"Red",notes:"",createdAt:"2025-11-25",updatedAt:"2025-11-25",deleted:false },
  { id:208,sn:208,client:"CMR",designation:"Mis & Costing",location:"Faridabad",name:"Vanshika Verma",actualDOJ:"2nd june",offerMonth:"2025-05-25",phone:"8077965722",resignationAcceptance:"Done",proposedDOJ:"Doj -2nd June 2025",owner:"Shruti",joiningStatus:"Offered",ctc:45000,statusCode:"Green",notes:"",createdAt:"2025-05-25",updatedAt:"2025-05-25",deleted:false },
  { id:297,sn:297,client:"Gyandhara",designation:"Dispatch Executive",location:"Lucknow",name:"Vimlesh",actualDOJ:"29th Nov",offerMonth:"2025-11-25",phone:"9918985502",resignationAcceptance:"Pending",proposedDOJ:"29th Nov",owner:"Chandni",joiningStatus:"Backout",ctc:23900,statusCode:"Red",notes:"",createdAt:"2025-11-25",updatedAt:"2025-11-25",deleted:false },
  { id:298,sn:298,client:"Ananda",designation:"HR Executive",location:"Khargone(MP)",name:"Vishal Sharma",actualDOJ:"1st dec",offerMonth:"2025-11-25",phone:"9580421205",resignationAcceptance:"completed",proposedDOJ:"1st dec",owner:"Ayush",joiningStatus:"Joined",ctc:15000,statusCode:"Green",notes:"",createdAt:"2025-11-25",updatedAt:"2025-11-25",deleted:false },
  { id:299,sn:299,client:"Elofic Industries",designation:"AM Production",location:"Faridabad",name:"Kailash Kumar",actualDOJ:"2026-01-03",offerMonth:"2025-11-25",phone:"9468237472",resignationAcceptance:"Pending",proposedDOJ:"1st Dec",owner:"Chandni",joiningStatus:"Joined",ctc:75000,statusCode:"Green",notes:"",createdAt:"2025-11-25",updatedAt:"2025-11-25",deleted:false },
  { id:300,sn:300,client:"Metal Seam",designation:"AM purchase",location:"Lucknow",name:"Chandan thankur",actualDOJ:"2025-12-15",offerMonth:"2025-11-25",phone:"9997167913",resignationAcceptance:"pending",proposedDOJ:"2025-12-10",owner:"Chandni",joiningStatus:"Joined",ctc:40000,statusCode:"Red",notes:"",createdAt:"2025-11-25",updatedAt:"2025-11-25",deleted:false },
  { id:302,sn:302,client:"Payal Group",designation:"AGM Purchase",location:"Dahej",name:"Rosald devasia",actualDOJ:"05 th Jan",offerMonth:"2025-11-25",phone:"9913560855",resignationAcceptance:"Complete",proposedDOJ:"2025-01-05",owner:"Chandni",joiningStatus:"Joined",ctc:250000,statusCode:"Green",notes:"",createdAt:"2025-11-25",updatedAt:"2025-11-25",deleted:false },
  { id:303,sn:303,client:"Metal Seam",designation:"Quality executive",location:"Lucknow",name:"Bhanwar singh",actualDOJ:"2026-01-02",offerMonth:"2025-11-25",phone:"6389696908",resignationAcceptance:"pending",proposedDOJ:"2025-01-05",owner:"Chandni",joiningStatus:"Joined",ctc:30000,statusCode:"Brown",notes:"",createdAt:"2025-11-25",updatedAt:"2025-11-25",deleted:false },
  { id:304,sn:304,client:"Elofic Industries",designation:"production engineer",location:"Nalagarh",name:"Shivam",actualDOJ:"",offerMonth:"2025-11-25",phone:"9991030400",resignationAcceptance:"Complete",proposedDOJ:"5 Th jan",owner:"Chandni",joiningStatus:"Backout",ctc:40000,statusCode:"Red",notes:"",createdAt:"2025-11-25",updatedAt:"2025-11-25",deleted:false },
  { id:305,sn:305,client:"NRB Bearing",designation:"Accounts",location:"Mumbai",name:"Akshay Srirang",actualDOJ:"2025-12-01",offerMonth:"2025-11-25",phone:"8850660548",resignationAcceptance:"Joined",proposedDOJ:"2025-12-01",owner:"Anushka",joiningStatus:"Backout",ctc:50000,statusCode:"Red",notes:"",createdAt:"2025-11-25",updatedAt:"2025-11-25",deleted:false },
  { id:306,sn:306,client:"Anada Group",designation:"purchase",location:"khargoan",name:"shubham",actualDOJ:"",offerMonth:"2025-11-25",phone:"8817169894",resignationAcceptance:"pending",proposedDOJ:"2025-12-15",owner:"Ayush",joiningStatus:"Offered",ctc:37000,statusCode:"Red",notes:"",createdAt:"2025-11-25",updatedAt:"2025-11-25",deleted:false },
  { id:254,sn:254,client:"CMR",designation:"Maintinace",location:"Vanod Gujarat",name:"Harssh Dave",actualDOJ:"6 th oct",offerMonth:"2025-09-25",phone:"9722233717",resignationAcceptance:"pending",proposedDOJ:"1st oct",owner:"Ample Leap",joiningStatus:"Offered",ctc:55000,statusCode:"Green",notes:"",createdAt:"2025-09-25",updatedAt:"2025-09-25",deleted:false },
  { id:283,sn:283,client:"CMR",designation:"Sr. executive Cold refining",location:"Jasarguda",name:"Shantanu kumar sahoo",actualDOJ:"backout",offerMonth:"2025-10-25",phone:"8260520998",resignationAcceptance:"Completed",proposedDOJ:"2025-10-15",owner:"Shruti",joiningStatus:"Offered",ctc:54000,statusCode:"Red",notes:"",createdAt:"2025-10-25",updatedAt:"2025-10-25",deleted:false },
  { id:309,sn:309,client:"Skylark Food",designation:"Mechanical engineer",location:"Safidon",name:"Surya kiran",actualDOJ:"2026-02-12",offerMonth:"2025-12-25",phone:"9304226231",resignationAcceptance:"Pending",proposedDOJ:"2025-02-12",owner:"Sanjay Sir",joiningStatus:"Joined",ctc:31000,statusCode:"Green",notes:"",createdAt:"2025-12-25",updatedAt:"2025-12-25",deleted:false },
  { id:310,sn:310,client:"Kokum Ply",designation:"HR manager",location:"Lucknow",name:"shasidhar pandey",actualDOJ:"2026-02-02",offerMonth:"2025-12-25",phone:"8126077892",resignationAcceptance:"Complete",proposedDOJ:"2025-01-28",owner:"Sameer Sir",joiningStatus:"Offered",ctc:47000,statusCode:"Red",notes:"",createdAt:"2025-12-25",updatedAt:"2025-12-25",deleted:false },
  { id:311,sn:311,client:"Vista Processed Foods",designation:"Quality head",location:"madnapalli",name:"Dr. saneedh anand",actualDOJ:"2026-02-23",offerMonth:"2025-12-25",phone:"9562049597",resignationAcceptance:"pending",proposedDOJ:"2026-02-16",owner:"Chandni",joiningStatus:"Offered",ctc:167000,statusCode:"Green",notes:"",createdAt:"2025-12-25",updatedAt:"2025-12-25",deleted:false },
  { id:312,sn:312,client:"TPack Packaging",designation:"Sr. executive - Production",location:"Silvasa",name:"Nishant Singh",actualDOJ:"2026-02-10",offerMonth:"2025-12-25",phone:"7905143889",resignationAcceptance:"Pending",proposedDOJ:"2026-02-10",owner:"Chandni",joiningStatus:"Joined",ctc:45000,statusCode:"Red",notes:"",createdAt:"2025-12-25",updatedAt:"2025-12-25",deleted:false },
  { id:231,sn:231,client:"CMR",designation:"Sr. executive quality",location:"Pillaipakkam",name:"Shri Ram",actualDOJ:"",offerMonth:"2025-06-25",phone:"9965470944",resignationAcceptance:"Pending",proposedDOJ:"2025-10-01",owner:"Shruti",joiningStatus:"Offered",ctc:50000,statusCode:"Red",notes:"",createdAt:"2025-06-25",updatedAt:"2025-06-25",deleted:false },
  { id:314,sn:314,client:"Metal Seam",designation:"PPc",location:"Lucknow",name:"Anubahv Srivastava",actualDOJ:"2026-02-02",offerMonth:"2025-12-25",phone:"8922913754",resignationAcceptance:"pending",proposedDOJ:"2025-02-02",owner:"Chandni",joiningStatus:"Offered",ctc:33000,statusCode:"Brown",notes:"",createdAt:"2025-12-25",updatedAt:"2025-12-25",deleted:false },
  { id:315,sn:315,client:"Metal Seam",designation:"MIS",location:"whatts",name:"Utkarsh Nag",actualDOJ:"",offerMonth:"2025-12-25",phone:"7071437710",resignationAcceptance:"pending",proposedDOJ:"2025-12-22",owner:"Chandni",joiningStatus:"Offered",ctc:21000,statusCode:"Red",notes:"",createdAt:"2025-12-25",updatedAt:"2025-12-25",deleted:false },
  { id:258,sn:258,client:"CMR",designation:"Senior executive - Hot refining",location:"Vanod Gujarat",name:"Girish",actualDOJ:"",offerMonth:"2025-09-25",phone:"8445771657",resignationAcceptance:"pending",proposedDOJ:"10 th oct",owner:"Shruti",joiningStatus:"Offered",ctc:35000,statusCode:"Red",notes:"",createdAt:"2025-09-25",updatedAt:"2025-09-25",deleted:false },
  { id:317,sn:317,client:"SM Auto",designation:"Sr.engineer NPD",location:"pimpri",name:"Sachin Bangar",actualDOJ:"2026-01-28",offerMonth:"2025-12-25",phone:"8208594465",resignationAcceptance:"pending",proposedDOJ:"2026-01-27",owner:"Ample Leap",joiningStatus:"Offered",ctc:60000,statusCode:"Green",notes:"",createdAt:"2025-12-25",updatedAt:"2025-12-25",deleted:false },
  { id:318,sn:318,client:"Xor technologies",designation:"EA",location:"Delhi",name:"Abhishek Gupta",actualDOJ:"2026-12-29",offerMonth:"2025-12-25",phone:"7068855870",resignationAcceptance:"pending",proposedDOJ:"2025-12-29",owner:"Nivedita",joiningStatus:"Offered",ctc:55000,statusCode:"Green",notes:"",createdAt:"2025-12-25",updatedAt:"2025-12-25",deleted:false },
  { id:319,sn:319,client:"Vista Processed Foods",designation:"Qa microbiologist",location:"punjab",name:"Divjot kaur",actualDOJ:"o2- feb",offerMonth:"2025-12-25",phone:"9780344000",resignationAcceptance:"pending",proposedDOJ:"2026-02-01",owner:"Harshita",joiningStatus:"Joined",ctc:30000,statusCode:"Yellow",notes:"",createdAt:"2025-12-25",updatedAt:"2025-12-25",deleted:false },
  { id:261,sn:261,client:"CMR",designation:"BE",location:"Bawal",name:"Pawan preet",actualDOJ:"",offerMonth:"2025-09-25",phone:"9317667650",resignationAcceptance:"pending",proposedDOJ:"2025-11-03",owner:"Shruti",joiningStatus:"Offered",ctc:65000,statusCode:"Red",notes:"",createdAt:"2025-09-25",updatedAt:"2025-09-25",deleted:false },
  { id:235,sn:235,client:"CMR",designation:"AM Quality",location:"Vanod Gujarat",name:"Parmeshwar Bala ji Madne",actualDOJ:"",offerMonth:"2025-06-25",phone:"9923689963",resignationAcceptance:"Pending",proposedDOJ:"DOJ - 1 Sep 2025",owner:"Chandni",joiningStatus:"Offered",ctc:60000,statusCode:"Red",notes:"",createdAt:"2025-06-25",updatedAt:"2025-06-25",deleted:false },
  { id:322,sn:322,client:"Alicon",designation:"Maintaience Head",location:"Chinchwad",name:"chandresh",actualDOJ:"",offerMonth:"2025-12-25",phone:"9923904768",resignationAcceptance:"",proposedDOJ:"2026-01-22",owner:"Pallavi",joiningStatus:"Offered",ctc:250000,statusCode:"Red",notes:"",createdAt:"2025-12-25",updatedAt:"2025-12-25",deleted:false },
  { id:323,sn:323,client:"Metal Seam",designation:"AM - Maintaience",location:"Lucknow",name:"Rishi Kumar Singh",actualDOJ:"2026-02-05",offerMonth:"2025-12-25",phone:"8115854099",resignationAcceptance:"pending",proposedDOJ:"2026-02-05",owner:"Chandni",joiningStatus:"Joined",ctc:60000,statusCode:"Brown",notes:"",createdAt:"2025-12-25",updatedAt:"2025-12-25",deleted:false },
  { id:217,sn:217,client:"CMR",designation:"Quality",location:"Halol",name:"Tarun makwana",actualDOJ:"",offerMonth:"2025-05-25",phone:"9662658955",resignationAcceptance:"pending",proposedDOJ:"2025-07-01",owner:"Harshita",joiningStatus:"Offered",ctc:47500,statusCode:"Red",notes:"",createdAt:"2025-05-25",updatedAt:"2025-05-25",deleted:false },
  { id:326,sn:326,client:"clivet Aircondisioning system Pvt limited",designation:"Application engineer",location:"Mumbai",name:"Mohd zikwan Ahemad",actualDOJ:"2 nd jan",offerMonth:"2025-12-25",phone:"7201978076",resignationAcceptance:"completed",proposedDOJ:"2 nd jan",owner:"Sanjay Sir",joiningStatus:"Joined",ctc:37000,statusCode:"Green",notes:"",createdAt:"2025-12-25",updatedAt:"2025-12-25",deleted:false },
  { id:153,sn:153,client:"CMR",designation:"Maintenance Head (electrical)",location:"Tirupati",name:"Arun",actualDOJ:"",offerMonth:"2024-12-24",phone:"9709099226",resignationAcceptance:"",proposedDOJ:"2024-02-03",owner:"Raksha",joiningStatus:"Backout",ctc:146000,statusCode:"Red",notes:"",createdAt:"2024-12-24",updatedAt:"2024-12-24",deleted:false },
  { id:328,sn:328,client:"Gyandhara",designation:"Dispatch executive",location:"Sandila",name:"Shashank",actualDOJ:"2026-12-18",offerMonth:"2025-12-25",phone:"6306782021",resignationAcceptance:"completed",proposedDOJ:"2026-12-18",owner:"Chandni",joiningStatus:"Joined",ctc:25000,statusCode:"Green",notes:"",createdAt:"2025-12-25",updatedAt:"2025-12-25",deleted:false },
  { id:329,sn:329,client:"Elofic Industries",designation:"Sr. engineer production",location:"Faridabad",name:"Manish kumar",actualDOJ:"2026-01-15",offerMonth:"2026-12-25",phone:"8894616803",resignationAcceptance:"completed",proposedDOJ:"2026-01-15",owner:"Chandni",joiningStatus:"Joined",ctc:36000,statusCode:"Green",notes:"",createdAt:"2026-12-25",updatedAt:"2026-12-25",deleted:false },
  { id:330,sn:330,client:"CMR",designation:"HR",location:"vallam",name:"Ramesh",actualDOJ:"2026-03-16",offerMonth:"2026-01-26",phone:"7028010783",resignationAcceptance:"pending",proposedDOJ:"2026-03-16",owner:"Pallavi",joiningStatus:"Joined",ctc:85000,statusCode:"Yellow",notes:"",createdAt:"2026-01-26",updatedAt:"2026-01-26",deleted:false },
  { id:331,sn:331,client:"Suspa",designation:"Quality engineer",location:"Gujrat",name:"Aamir khatri",actualDOJ:"2026-03-09",offerMonth:"2026-01-26",phone:"",resignationAcceptance:"pending",proposedDOJ:"2026-03-09",owner:"Chandni",joiningStatus:"Joined",ctc:35000,statusCode:"Yellow",notes:"",createdAt:"2026-01-26",updatedAt:"2026-01-26",deleted:false },
  { id:332,sn:332,client:"Metal Seam",designation:"Sr. purchase executive",location:"Lucknow",name:"Shailendra pandey",actualDOJ:"2026-02-02",offerMonth:"2026-01-26",phone:"8400340331",resignationAcceptance:"pending",proposedDOJ:"2026-02-02",owner:"Chandni",joiningStatus:"Joined",ctc:35000,statusCode:"Brown",notes:"",createdAt:"2026-01-26",updatedAt:"2026-01-26",deleted:false },
  { id:333,sn:333,client:"SM Auto",designation:"AM - QA",location:"Hosour",name:"prashnath P",actualDOJ:"",offerMonth:"2026-01-26",phone:"8883082801",resignationAcceptance:"Pending",proposedDOJ:"2026-02-16",owner:"Harshita",joiningStatus:"Offered",ctc:65000,statusCode:"Red",notes:"",createdAt:"2026-01-26",updatedAt:"2026-01-26",deleted:false },
  { id:334,sn:334,client:"Gyandhara",designation:"Sales officer",location:"Mirzapur",name:"Adarsh",actualDOJ:"2026-01-16",offerMonth:"2026-01-26",phone:"8423709914",resignationAcceptance:"pending",proposedDOJ:"2026-01-16",owner:"Chandni",joiningStatus:"Joined",ctc:32000,statusCode:"Green",notes:"",createdAt:"2026-01-26",updatedAt:"2026-01-26",deleted:false },
  { id:335,sn:335,client:"Gyandhara",designation:"Sales officer",location:"Ballia",name:"Chandrakant",actualDOJ:"",offerMonth:"2026-01-26",phone:"9565501995",resignationAcceptance:"completed",proposedDOJ:"2026-01-15",owner:"Chandni",joiningStatus:"Offered",ctc:32000,statusCode:"Red",notes:"",createdAt:"2026-01-26",updatedAt:"2026-01-26",deleted:false },
  { id:336,sn:336,client:"SM Auto",designation:"Material engineer",location:"Chakan",name:"Rushikesh Shinde",actualDOJ:"",offerMonth:"2026-01-26",phone:"7276724858",resignationAcceptance:"pending",proposedDOJ:"16 th Feb",owner:"Sanjay Sir",joiningStatus:"Offered",ctc:46000,statusCode:"Red",notes:"",createdAt:"2026-01-26",updatedAt:"2026-01-26",deleted:false },
  { id:337,sn:337,client:"CMR",designation:"Hot refining",location:"Gujrat",name:"Pankaj Sharma",actualDOJ:"",offerMonth:"2026-01-26",phone:"6351498015",resignationAcceptance:"Pending",proposedDOJ:"16 Th March",owner:"Ample Leap",joiningStatus:"Offered",ctc:34000,statusCode:"Red",notes:"",createdAt:"2026-01-26",updatedAt:"2026-01-26",deleted:false },
  { id:338,sn:338,client:"CMR",designation:"Cold refining",location:"Vanod Gujarat",name:"Tarun",actualDOJ:"",offerMonth:"2026-01-26",phone:"7905278294",resignationAcceptance:"Pending",proposedDOJ:"16 th march",owner:"Puja",joiningStatus:"Offered",ctc:54000,statusCode:"Red",notes:"",createdAt:"2026-01-26",updatedAt:"2026-01-26",deleted:false },
  { id:339,sn:339,client:"Skylark Food",designation:"sr. executive purchase",location:"Safidon",name:"Raman pandita",actualDOJ:"2026-01-28",offerMonth:"2026-01-26",phone:"7006723615",resignationAcceptance:"Pending",proposedDOJ:"27 th Jan",owner:"Sanjay Sir",joiningStatus:"Offered",ctc:57000,statusCode:"Red",notes:"",createdAt:"2026-01-26",updatedAt:"2026-01-26",deleted:false },
  { id:340,sn:340,client:"CMR",designation:"cold refining",location:"Haridwar",name:"Om narayan Sharma",actualDOJ:"2026-03-03",offerMonth:"2026-01-26",phone:"849048771",resignationAcceptance:"pending",proposedDOJ:"2026-03-03",owner:"Akshat",joiningStatus:"Joined",ctc:51000,statusCode:"Yellow",notes:"",createdAt:"2026-01-26",updatedAt:"2026-01-26",deleted:false },
  { id:341,sn:341,client:"Skylark Food",designation:"AM- purchase",location:"Safidon",name:"Ajay verma",actualDOJ:"2026-03-02",offerMonth:"2026-01-26",phone:"7015196439",resignationAcceptance:"pendng",proposedDOJ:"2 nd march",owner:"Sanjay Sir",joiningStatus:"Offered",ctc:75000,statusCode:"Yellow",notes:"",createdAt:"2026-01-26",updatedAt:"2026-01-26",deleted:false },
  { id:341,sn:341,client:"Metal Seam",designation:"MIS executive",location:"Lucknow",name:"Ajeet Soni",actualDOJ:"2026-02-02",offerMonth:"2026-01-26",phone:"8299033430",resignationAcceptance:"pending",proposedDOJ:"2026-02-02",owner:"Chandni",joiningStatus:"Joined",ctc:20000,statusCode:"Brown",notes:"",createdAt:"2026-01-26",updatedAt:"2026-01-26",deleted:false },
  { id:342,sn:342,client:"Purflux",designation:"DM inward & PPC",location:"Manesar",name:"Parsuram Nayak",actualDOJ:"2026-02-23",offerMonth:"2026-01-26",phone:"9971128589",resignationAcceptance:"pending",proposedDOJ:"2026-02-23",owner:"Chandni",joiningStatus:"Offered",ctc:134000,statusCode:"Yellow",notes:"",createdAt:"2026-01-26",updatedAt:"2026-01-26",deleted:false },
  { id:343,sn:343,client:"Elofic Industries",designation:"Store executive",location:"faridabad",name:"Ashok",actualDOJ:"2026-03-09",offerMonth:"2026-02-26",phone:"9113347768",resignationAcceptance:"pending",proposedDOJ:"2026-03-09",owner:"Chandni",joiningStatus:"Offered",ctc:35000,statusCode:"Yellow",notes:"",createdAt:"2026-02-26",updatedAt:"2026-02-26",deleted:false },
  { id:344,sn:344,client:"Jyoti Steel",designation:"Senior Manager export",location:"",name:"Chirag Shah",actualDOJ:"4 th March",offerMonth:"2026-02-26",phone:"9022460893",resignationAcceptance:"pending",proposedDOJ:"2026-03-08",owner:"Chandni",joiningStatus:"Offered",ctc:226000,statusCode:"Yellow",notes:"",createdAt:"2026-02-26",updatedAt:"2026-02-26",deleted:false },
  { id:345,sn:345,client:"Purflux",designation:"production Manager",location:"Manesar",name:"Jasbir singh",actualDOJ:"2026-03-02",offerMonth:"2026-02-26",phone:"9540567973",resignationAcceptance:"Pending",proposedDOJ:"2026-03-06",owner:"Chandni",joiningStatus:"Joined",ctc:135000,statusCode:"Yellow",notes:"",createdAt:"2026-02-26",updatedAt:"2026-02-26",deleted:false },
  { id:346,sn:346,client:"Metal Seam",designation:"Store manager",location:"Lucknow",name:"Rajeev",actualDOJ:"2026-03-27",offerMonth:"2026-02-26",phone:"9999270396",resignationAcceptance:"Pending",proposedDOJ:"2026-03-27",owner:"Chandni",joiningStatus:"Joined",ctc:75000,statusCode:"Brown",notes:"",createdAt:"2026-02-26",updatedAt:"2026-02-26",deleted:false },
  { id:347,sn:347,client:"CMR",designation:"Am -Mechanical",location:"pillaipakam",name:"G.vijya raja",actualDOJ:"2026-04-15",offerMonth:"2026-02-26",phone:"7667535516",resignationAcceptance:"completed",proposedDOJ:"2026-04-15",owner:"Puja",joiningStatus:"Offered",ctc:60000,statusCode:"Brown",notes:"",createdAt:"2026-02-26",updatedAt:"2026-02-26",deleted:false },
  { id:348,sn:348,client:"Elofic Industries",designation:"production Manager",location:"Faridbad",name:"Balvinder",actualDOJ:"2026-03-02",offerMonth:"2026-02-26",phone:"9805599702",resignationAcceptance:"completed",proposedDOJ:"2026-03-02",owner:"Chandni",joiningStatus:"Joined",ctc:140000,statusCode:"Yellow",notes:"",createdAt:"2026-02-26",updatedAt:"2026-02-26",deleted:false },
  { id:349,sn:349,client:"CMR",designation:"Hot refining",location:"Vanod",name:"Abhishek kushwaha",actualDOJ:"1 st april",offerMonth:"2026-02-26",phone:"9540065878",resignationAcceptance:"completed",proposedDOJ:"1 St april",owner:"Akshat",joiningStatus:"Offered",ctc:60000,statusCode:"Brown",notes:"",createdAt:"2026-02-26",updatedAt:"2026-02-26",deleted:false },
  { id:350,sn:350,client:"CMR",designation:"Quality control",location:"Vanod",name:"Kunj sukhadiya",actualDOJ:"2026-03-16",offerMonth:"2026-02-26",phone:"9998547321",resignationAcceptance:"pending",proposedDOJ:"2026-03-16",owner:"Akshat",joiningStatus:"Offered",ctc:55000,statusCode:"Brown",notes:"",createdAt:"2026-02-26",updatedAt:"2026-02-26",deleted:false },
  { id:351,sn:351,client:"SM Auto",designation:"Deputy Quality Assurance",location:"Hosur",name:"Gajendran E",actualDOJ:"",offerMonth:"2026-02-26",phone:"7892500623",resignationAcceptance:"completed",proposedDOJ:"2026-04-13",owner:"Harshita",joiningStatus:"Offered",ctc:84000,statusCode:"Red",notes:"",createdAt:"2026-02-26",updatedAt:"2026-02-26",deleted:false },
  { id:351,sn:351,client:"CMR",designation:"Electrical maintinace",location:"Vanod",name:"Kisan kumar",actualDOJ:"1 st april",offerMonth:"2026-02-26",phone:"7988443104",resignationAcceptance:"Pending",proposedDOJ:"1 st april",owner:"Puja",joiningStatus:"Offered",ctc:53000,statusCode:"Brown",notes:"",createdAt:"2026-02-26",updatedAt:"2026-02-26",deleted:false },
  { id:352,sn:352,client:"Purflux",designation:"Quality Head",location:"Pune",name:"Ajay gaikawad",actualDOJ:"2026-03-23",offerMonth:"2026-02-26",phone:"9819683943",resignationAcceptance:"Pending",proposedDOJ:"2026-03-23",owner:"Chandni",joiningStatus:"Offered",ctc:260000,statusCode:"Brown",notes:"",createdAt:"2026-02-26",updatedAt:"2026-02-26",deleted:false },
  { id:353,sn:353,client:"CMR",designation:"cold refining",location:"Tirupati",name:"Patania poorna rakesh",actualDOJ:"",offerMonth:"2026-02-26",phone:"7396077733",resignationAcceptance:"pending",proposedDOJ:"1 st april",owner:"Akshat",joiningStatus:"Offered",ctc:54000,statusCode:"Red",notes:"",createdAt:"2026-02-26",updatedAt:"2026-02-26",deleted:false },
  { id:354,sn:354,client:"CMR",designation:"HOT refining",location:"Odisha",name:"kamal kishor Sahoo",actualDOJ:"",offerMonth:"2026-02-26",phone:"9179253732",resignationAcceptance:"Pending",proposedDOJ:"15 th april",owner:"Akshat",joiningStatus:"Offered",ctc:50000,statusCode:"Red",notes:"",createdAt:"2026-02-26",updatedAt:"2026-02-26",deleted:false },
  { id:355,sn:355,client:"Metal Seam",designation:"AM - HR",location:"Lucknow",name:"Vijay yadav",actualDOJ:"2026-04-06",offerMonth:"2026-02-26",phone:"9096000214",resignationAcceptance:"pending",proposedDOJ:"2026-04-06",owner:"Chandni",joiningStatus:"Offered",ctc:53000,statusCode:"Brown",notes:"",createdAt:"2026-02-26",updatedAt:"2026-02-26",deleted:false },
  { id:356,sn:356,client:"Dashmesh group",designation:"Sales",location:"Borivali",name:"Hardev Singh",actualDOJ:"2026-03-16",offerMonth:"2026-02-26",phone:"9879253262",resignationAcceptance:"Pending",proposedDOJ:"2026-03-16",owner:"Pallavi",joiningStatus:"Offered",ctc:200000,statusCode:"Yellow",notes:"",createdAt:"2026-02-26",updatedAt:"2026-02-26",deleted:false },
  { id:357,sn:357,client:"SM Auto",designation:"Marterial engineer",location:"Pune",name:"sushant Kumar",actualDOJ:"2026-03-17",offerMonth:"2026-02-26",phone:"9430677390",resignationAcceptance:"Completed",proposedDOJ:"2026-03-09",owner:"Harshita",joiningStatus:"Offered",ctc:30000,statusCode:"Yellow",notes:"",createdAt:"2026-02-26",updatedAt:"2026-02-26",deleted:false },
  { id:358,sn:358,client:"CMR",designation:"AM - Quality control",location:"Soolagiri",name:"Suchi charan",actualDOJ:"",offerMonth:"2026-02-26",phone:"8248778851",resignationAcceptance:"Completed",proposedDOJ:"15 th june",owner:"Akshat",joiningStatus:"Offered",ctc:50000,statusCode:"Orange",notes:"",createdAt:"2026-02-26",updatedAt:"2026-02-26",deleted:false },
  { id:359,sn:359,client:"clivet Aircondisioning system Pvt limited",designation:"Application engineer",location:"Mumbai",name:"Tanay shah",actualDOJ:"2026-03-11",offerMonth:"2026-03-26",phone:"9372513892",resignationAcceptance:"comleted",proposedDOJ:"2026-03-11",owner:"Sanjay Sir",joiningStatus:"Joined",ctc:26000,statusCode:"Green",notes:"",createdAt:"2026-03-26",updatedAt:"2026-03-26",deleted:false },
  { id:360,sn:360,client:"CMR",designation:"Senior executive Dispatch",location:"Soolagiri",name:"prabhakaran DJ",actualDOJ:"04th May",offerMonth:"2026-03-26",phone:"7092041342",resignationAcceptance:"pending",proposedDOJ:"04 th May",owner:"Anjali",joiningStatus:"Offered",ctc:48000,statusCode:"Brown",notes:"",createdAt:"2026-03-26",updatedAt:"2026-03-26",deleted:false },
  { id:361,sn:361,client:"Gravita",designation:"production executive",location:"Mundra , gujrat",name:"Muneendra kumar",actualDOJ:"2026-04-13",offerMonth:"2026-03-26",phone:"7505210980",resignationAcceptance:"pending",proposedDOJ:"2026-04-13",owner:"Chandni",joiningStatus:"Offered",ctc:38000,statusCode:"Green",notes:"",createdAt:"2026-03-26",updatedAt:"2026-03-26",deleted:false },
  { id:362,sn:362,client:"CMR",designation:"AM - Dispatch",location:"Soolagiri",name:"R. Paneer Selven",actualDOJ:"2026-04-16",offerMonth:"2026-03-26",phone:"9940183904",resignationAcceptance:"Pending",proposedDOJ:"2026-04-16",owner:"Anjali",joiningStatus:"Offered",ctc:69000,statusCode:"Brown",notes:"",createdAt:"2026-03-26",updatedAt:"2026-03-26",deleted:false },
  { id:363,sn:363,client:"Gyandhara",designation:"Admin executive",location:"Lucknow",name:"Gaurav Srivastava",actualDOJ:"2026-04-16",offerMonth:"2026-03-26",phone:"9696282815",resignationAcceptance:"Complete",proposedDOJ:"2026-04-16",owner:"Sarojni",joiningStatus:"Joined",ctc:23000,statusCode:"Brown",notes:"",createdAt:"2026-03-26",updatedAt:"2026-03-26",deleted:false },
  { id:363,sn:363,client:"CMR",designation:"Cold refining",location:"Soolagiri",name:"Vijaya kumar",actualDOJ:"04th May",offerMonth:"2026-03-26",phone:"9600866983",resignationAcceptance:"Pending",proposedDOJ:"2026-04-27",owner:"Puja",joiningStatus:"Offered",ctc:49000,statusCode:"Brown",notes:"",createdAt:"2026-03-26",updatedAt:"2026-03-26",deleted:false },
  { id:364,sn:364,client:"CMR",designation:"PPC",location:"Tirupati",name:"pravesh ranjan",actualDOJ:"",offerMonth:"2026-03-26",phone:"8596911837",resignationAcceptance:"Completed",proposedDOJ:"2026-06-18",owner:"Ample Leap",joiningStatus:"Offered",ctc:55000,statusCode:"Orange",notes:"",createdAt:"2026-03-26",updatedAt:"2026-03-26",deleted:false },
  { id:365,sn:365,client:"Elofic Industries",designation:"finance Manager",location:"Faridbad",name:"Mukesh Dhiman",actualDOJ:"2026-04-02",offerMonth:"2026-03-26",phone:"8901143460",resignationAcceptance:"completed",proposedDOJ:"2026-04-02",owner:"Nivedita",joiningStatus:"Offered",ctc:100000,statusCode:"Brown",notes:"",createdAt:"2026-03-26",updatedAt:"2026-03-26",deleted:false },
  { id:366,sn:366,client:"TPack Packaging",designation:"Mould Maintaience",location:"umbergaon",name:"Pentakota venket",actualDOJ:"2026-04-14",offerMonth:"2026-03-26",phone:"6304704210",resignationAcceptance:"complete",proposedDOJ:"2026-04-14",owner:"Harshita",joiningStatus:"Offered",ctc:45000,statusCode:"Brown",notes:"",createdAt:"2026-03-26",updatedAt:"2026-03-26",deleted:false },
  { id:367,sn:367,client:"Elofic Industries",designation:"AM -production",location:"Nalagarh",name:"Sunil",actualDOJ:"4 Th May",offerMonth:"2026-03-26",phone:"8221867777",resignationAcceptance:"pending",proposedDOJ:"2026-05-05",owner:"Chandni",joiningStatus:"Offered",ctc:75000,statusCode:"Brown",notes:"",createdAt:"2026-03-26",updatedAt:"2026-03-26",deleted:false },
  { id:368,sn:368,client:"CMR",designation:"Cold refining",location:"Tirupati",name:"Sibashis behra",actualDOJ:"4th May",offerMonth:"2026-03-26",phone:"6352012579",resignationAcceptance:"Pending",proposedDOJ:"2026-05-04",owner:"Akshat",joiningStatus:"Offered",ctc:49000,statusCode:"Brown",notes:"",createdAt:"2026-03-26",updatedAt:"2026-03-26",deleted:false },
  { id:369,sn:369,client:"CMR",designation:"Electrical maintinace",location:"Soolagiri",name:"Rakesh kumar",actualDOJ:"2026-05-18",offerMonth:"2026-03-26",phone:"7788868908",resignationAcceptance:"completed",proposedDOJ:"2026-05-18",owner:"Puja",joiningStatus:"Offered",ctc:49000,statusCode:"Brown",notes:"",createdAt:"2026-03-26",updatedAt:"2026-03-26",deleted:false },
  { id:370,sn:370,client:"CMR",designation:"Hot Refining",location:"Soolagiri",name:"bhuvaneshwaran M",actualDOJ:"1 st june",offerMonth:"2026-03-26",phone:"9442035904",resignationAcceptance:"Pending",proposedDOJ:"1st june",owner:"Akshat",joiningStatus:"Joined",ctc:48000,statusCode:"Brown",notes:"",createdAt:"2026-03-26",updatedAt:"2026-03-26",deleted:false },
  { id:371,sn:371,client:"Vista Processed Foods",designation:"AM-NPD",location:"Mumbai",name:"Santosh Pariskar",actualDOJ:"4 th May",offerMonth:"2026-03-26",phone:"8446759235",resignationAcceptance:"pending",proposedDOJ:"4 th May",owner:"Sanjay Sir",joiningStatus:"Offered",ctc:62000,statusCode:"Brown",notes:"",createdAt:"2026-03-26",updatedAt:"2026-03-26",deleted:false },
  { id:312,sn:312,client:"Corob",designation:"Service Engineer",location:"vallore",name:"parmeshwaran Aurmugan",actualDOJ:"",offerMonth:"2026-03-26",phone:"",resignationAcceptance:"completed",proposedDOJ:"",owner:"Harshita",joiningStatus:"Joined",ctc:25000,statusCode:"Green",notes:"",createdAt:"2026-03-26",updatedAt:"2026-03-26",deleted:false },
  { id:313,sn:313,client:"Gravita",designation:"Production",location:"Mundra , gujrat",name:"Amarjeet Kumar",actualDOJ:"1st May",offerMonth:"2026-03-26",phone:"8949370859",resignationAcceptance:"completed",proposedDOJ:"1 st may",owner:"Akshat",joiningStatus:"Offered",ctc:42500,statusCode:"Brown",notes:"",createdAt:"2026-03-26",updatedAt:"2026-03-26",deleted:false },
  { id:314,sn:314,client:"Elofic Industries",designation:"ESG",location:"Nalagarh",name:"Nikhil",actualDOJ:"2026-04-06",offerMonth:"2026-03-26",phone:"7052239217",resignationAcceptance:"completed",proposedDOJ:"2026-04-06",owner:"Chandni",joiningStatus:"Offered",ctc:30000,statusCode:"Brown",notes:"",createdAt:"2026-03-26",updatedAt:"2026-03-26",deleted:false },
  { id:315,sn:315,client:"Dashmesh group",designation:"HR Manager",location:"boriwali",name:"Rajesh chaugle",actualDOJ:"",offerMonth:"2026-03-26",phone:"7777011611",resignationAcceptance:"completed .",proposedDOJ:"2026-05-18",owner:"Pallavi",joiningStatus:"Offered",ctc:250000,statusCode:"Red",notes:"",createdAt:"2026-03-26",updatedAt:"2026-03-26",deleted:false },
  { id:316,sn:316,client:"Vista Processed Foods",designation:"Kam Manager",location:"North",name:"Apoorva saxena",actualDOJ:"",offerMonth:"2026-03-26",phone:"9621473948",resignationAcceptance:"pending",proposedDOJ:"4 th june",owner:"Sanjay Sir",joiningStatus:"Offered",ctc:140000,statusCode:"Orange",notes:"",createdAt:"2026-03-26",updatedAt:"2026-03-26",deleted:false },
  { id:317,sn:317,client:"Kokam ply",designation:"PRE",location:"Lucknow",name:"Sangeeta Yadav",actualDOJ:"2026-04-06",offerMonth:"2026-04-26",phone:"7510077250",resignationAcceptance:"Completed",proposedDOJ:"6 th April",owner:"Shyam+Pallavi",joiningStatus:"Joined",ctc:25000,statusCode:"Brown",notes:"",createdAt:"2026-04-26",updatedAt:"2026-04-26",deleted:false },
  { id:318,sn:318,client:"CMR",designation:"Sr, executive",location:"Soolagiri",name:"Veergurunathan S.",actualDOJ:"",offerMonth:"2026-04-26",phone:"8940624600",resignationAcceptance:"completed",proposedDOJ:"15 th june",owner:"Akshat",joiningStatus:"Offered",ctc:40000,statusCode:"Orange",notes:"",createdAt:"2026-04-26",updatedAt:"2026-04-26",deleted:false },
  { id:319,sn:319,client:"Vista Processed Foods",designation:"quality",location:"Sirhind",name:"Rohit",actualDOJ:"2026-05-11",offerMonth:"2026-04-26",phone:"8894605490",resignationAcceptance:"completed",proposedDOJ:"2026-05-11",owner:"Harshita",joiningStatus:"Offered",ctc:41000,statusCode:"Brown",notes:"",createdAt:"2026-04-26",updatedAt:"2026-04-26",deleted:false },
  { id:320,sn:320,client:"Jageram",designation:"Sr. executive Accounts",location:"Mundka",name:"Mohan Joshi",actualDOJ:"2026-04-20",offerMonth:"2026-04-26",phone:"9694277907",resignationAcceptance:"Completed",proposedDOJ:"2026-04-20",owner:"Sarojni",joiningStatus:"Offered",ctc:41000,statusCode:"Brown",notes:"",createdAt:"2026-04-26",updatedAt:"2026-04-26",deleted:false },
  { id:321,sn:321,client:"CMR",designation:"Store",location:"Shoolagiri",name:"Ravi. K",actualDOJ:"2026-05-18",offerMonth:"2026-04-26",phone:"6379384979",resignationAcceptance:"completed",proposedDOJ:"1 st june",owner:"Puja",joiningStatus:"Offered",ctc:42000,statusCode:"Brown",notes:"",createdAt:"2026-04-26",updatedAt:"2026-04-26",deleted:false },
  { id:322,sn:322,client:"Tinna rubber",designation:"HR Manger",location:"Mahrauli ,delhi",name:"Mahesh Sharma",actualDOJ:"",offerMonth:"2026-04-26",phone:"9766775243",resignationAcceptance:"pending",proposedDOJ:"22 nd May",owner:"Pallavi",joiningStatus:"Offered",ctc:150000,statusCode:"Red",notes:"",createdAt:"2026-04-26",updatedAt:"2026-04-26",deleted:false },
  { id:323,sn:323,client:"CMR",designation:"Deputy manager Quality",location:"Sri perambadur",name:"Amanth kumar",actualDOJ:"",offerMonth:"2026-04-26",phone:"8489459157",resignationAcceptance:"completed",proposedDOJ:"1st july",owner:"Anshika",joiningStatus:"Offered",ctc:100000,statusCode:"Orange",notes:"",createdAt:"2026-04-26",updatedAt:"2026-04-26",deleted:false },
  { id:324,sn:324,client:"AP Rubber",designation:"Production Supervisor",location:"Haridwar",name:"Alok",actualDOJ:"",offerMonth:"2026-04-26",phone:"8171152577",resignationAcceptance:"pending",proposedDOJ:"2026-05-15",owner:"Anshika",joiningStatus:"Offered",ctc:37000,statusCode:"Red",notes:"",createdAt:"2026-04-26",updatedAt:"2026-04-26",deleted:false },
  { id:325,sn:325,client:"Jageram",designation:"front office",location:"Mundka",name:"Aditi",actualDOJ:"2026-04-27",offerMonth:"2026-04-26",phone:"6200374277",resignationAcceptance:"completed",proposedDOJ:"2026-04-27",owner:"Sarojni",joiningStatus:"Joined",ctc:25000,statusCode:"Red",notes:"",createdAt:"2026-04-26",updatedAt:"2026-04-26",deleted:false },
  { id:326,sn:326,client:"Corob",designation:"Software tester",location:"Bhilad",name:"Nikesh Ingle",actualDOJ:"4th May",offerMonth:"2026-04-26",phone:"9545617583",resignationAcceptance:"pending",proposedDOJ:"4 Th May",owner:"Nivedita",joiningStatus:"Offered",ctc:58000,statusCode:"Brown",notes:"",createdAt:"2026-04-26",updatedAt:"2026-04-26",deleted:false },
  { id:327,sn:327,client:"Elofic Industries",designation:"Sr. engineer Quality",location:"Noida",name:"Lokesh Kumar",actualDOJ:"1 st june",offerMonth:"2026-04-26",phone:"7906206893",resignationAcceptance:"completed",proposedDOJ:"14 th May",owner:"Chandni",joiningStatus:"Offered",ctc:41000,statusCode:"Brown",notes:"",createdAt:"2026-04-26",updatedAt:"2026-04-26",deleted:false },
  { id:328,sn:328,client:"Suapa",designation:"PPC",location:"Gujrat",name:"Prashant singh",actualDOJ:"",offerMonth:"2026-04-26",phone:"09026032764",resignationAcceptance:"completed",proposedDOJ:"2026-06-15",owner:"Chandni",joiningStatus:"Offered",ctc:45000,statusCode:"Orange",notes:"",createdAt:"2026-04-26",updatedAt:"2026-04-26",deleted:false },
  { id:329,sn:329,client:"FIL Industries",designation:"Inventory",location:"Vidisha",name:"Rupendra",actualDOJ:"2026-05-25",offerMonth:"2026-04-26",phone:"9098654254",resignationAcceptance:"pending",proposedDOJ:"2026-05-25",owner:"Anshika",joiningStatus:"Offered",ctc:55000,statusCode:"Brown",notes:"",createdAt:"2026-04-26",updatedAt:"2026-04-26",deleted:false },
  { id:330,sn:330,client:"SM Auto",designation:"AM production",location:"Hosour",name:"Tilakraj",actualDOJ:"2026-04-13",offerMonth:"2026-04-26",phone:"",resignationAcceptance:"Completed",proposedDOJ:"2026-04-13",owner:"Nivedita",joiningStatus:"Joined",ctc:50000,statusCode:"Red",notes:"",createdAt:"2026-04-26",updatedAt:"2026-04-26",deleted:false },
  { id:331,sn:331,client:"Prag industries",designation:"Accounts",location:"Lucknow",name:"Himanshu",actualDOJ:"",offerMonth:"2026-04-26",phone:"",resignationAcceptance:"pending",proposedDOJ:"",owner:"Nivedita",joiningStatus:"Offered",ctc:80000,statusCode:"Orange",notes:"",createdAt:"2026-04-26",updatedAt:"2026-04-26",deleted:false },
  { id:332,sn:332,client:"Prag industries",designation:"purchase manager",location:"Lucknow",name:"Abhishek",actualDOJ:"",offerMonth:"2026-05-26",phone:"",resignationAcceptance:"pending",proposedDOJ:"",owner:"Nivedita",joiningStatus:"Offered",ctc:73000,statusCode:"Red",notes:"",createdAt:"2026-05-26",updatedAt:"2026-05-26",deleted:false },
  { id:333,sn:333,client:"Corob",designation:"Quality executive",location:"Bhilad",name:"Yash Halpati",actualDOJ:"",offerMonth:"2026-05-26",phone:"7984759219",resignationAcceptance:"Pending",proposedDOJ:"1 st june",owner:"Sanjay Sir",joiningStatus:"Offered",ctc:39000,statusCode:"Red",notes:"",createdAt:"2026-05-26",updatedAt:"2026-05-26",deleted:false },
  { id:334,sn:334,client:"Purflux",designation:"sr. manager Accounts",location:"Manesar",name:"Panchanan Saw",actualDOJ:"",offerMonth:"2026-05-26",phone:"9868620966",resignationAcceptance:"pending",proposedDOJ:"2026-06-15",owner:"Pallavi",joiningStatus:"Offered",ctc:267000,statusCode:"Red",notes:"",createdAt:"2026-05-26",updatedAt:"2026-05-26",deleted:false },
  { id:335,sn:335,client:"AP Rubber",designation:"Plant head",location:"Oman",name:"Sanjay Aher",actualDOJ:"",offerMonth:"2026-05-26",phone:"8878019022",resignationAcceptance:"Pending",proposedDOJ:"tentative",owner:"Chandni",joiningStatus:"Offered",ctc:184000,statusCode:"Orange",notes:"",createdAt:"2026-05-26",updatedAt:"2026-05-26",deleted:false },
  { id:336,sn:336,client:"prag aeronutics",designation:"operations manager",location:"Lucknow",name:"Upendra",actualDOJ:"",offerMonth:"2026-05-26",phone:"8750730420",resignationAcceptance:"completed",proposedDOJ:"2026-08-08",owner:"Anshika",joiningStatus:"Offered",ctc:78000,statusCode:"Orange",notes:"",createdAt:"2026-05-26",updatedAt:"2026-05-26",deleted:false },
  { id:337,sn:337,client:"FIL Industries",designation:"RSM CPD",location:"Pune",name:"Bhushan",actualDOJ:"",offerMonth:"2026-05-26",phone:"9730445629",resignationAcceptance:"Pending",proposedDOJ:"2026-06-15",owner:"Pallavi",joiningStatus:"Offered",ctc:145000,statusCode:"Orange",notes:"",createdAt:"2026-05-26",updatedAt:"2026-05-26",deleted:false },
  { id:338,sn:338,client:"CMR",designation:"DY manager - HR IR",location:"pillaipakam",name:"Kartik",actualDOJ:"",offerMonth:"2026-05-26",phone:"7010905210",resignationAcceptance:"completed",proposedDOJ:"1 st july",owner:"Ample Leap",joiningStatus:"Offered",ctc:100000,statusCode:"Orange",notes:"",createdAt:"2026-05-26",updatedAt:"2026-05-26",deleted:false },
  { id:339,sn:339,client:"Vista Processed Foods",designation:"EA to Director",location:"Mumbai",name:"Ridhi Mahadik",actualDOJ:"",offerMonth:"2026-05-26",phone:"8779625774",resignationAcceptance:"Completed",proposedDOJ:"2026-06-15",owner:"Sanjay Sir",joiningStatus:"Offered",ctc:67000,statusCode:"Orange",notes:"",createdAt:"2026-05-26",updatedAt:"2026-05-26",deleted:false },
  { id:340,sn:340,client:"Metal Seam",designation:"Tool room Head",location:"Lucknow",name:"Anurag",actualDOJ:"",offerMonth:"2026-05-26",phone:"9953635676",resignationAcceptance:"completed",proposedDOJ:"2026-06-16",owner:"Chandni",joiningStatus:"Offered",ctc:112500,statusCode:"Orange",notes:"",createdAt:"2026-05-26",updatedAt:"2026-05-26",deleted:false },
  { id:341,sn:341,client:"CMR",designation:"Accounts",location:"",name:"Mahesh",actualDOJ:"",offerMonth:"2026-05-26",phone:"7032116167",resignationAcceptance:"completed",proposedDOJ:"2026-07-01",owner:"Puja",joiningStatus:"Offered",ctc:56000,statusCode:"Orange",notes:"",createdAt:"2026-05-26",updatedAt:"2026-05-26",deleted:false },
  { id:342,sn:342,client:"CMR",designation:"sr. executive Hot refining",location:"Pillaipakam",name:"Krishnam raju",actualDOJ:"1st june",offerMonth:"2026-05-26",phone:"8500124544",resignationAcceptance:"Completed",proposedDOJ:"1 st july",owner:"Anjali",joiningStatus:"Offered",ctc:45000,statusCode:"Brown",notes:"",createdAt:"2026-05-26",updatedAt:"2026-05-26",deleted:false },
  { id:343,sn:343,client:"Vivo",designation:"",location:"",name:"Third party billing",actualDOJ:"",offerMonth:"",phone:"",resignationAcceptance:"pending",proposedDOJ:"",owner:"",joiningStatus:"",ctc:63000,statusCode:"Yellow",notes:"",createdAt:"2024-01-01",updatedAt:"2024-01-01",deleted:false },
  { id:344,sn:344,client:"Tinna rubber",designation:"Manager Sales north",location:"Delhi",name:"Kuldeep Srivastava",actualDOJ:"",offerMonth:"2026-05-26",phone:"9310077652",resignationAcceptance:"completed",proposedDOJ:"9 th june",owner:"Sanjay Sir",joiningStatus:"Offered",ctc:120000,statusCode:"Orange",notes:"",createdAt:"2026-05-26",updatedAt:"2026-05-26",deleted:false },
  { id:345,sn:345,client:"Gyandhara",designation:"Sales executive",location:"MP",name:"Sachin",actualDOJ:"",offerMonth:"2026-05-26",phone:"8719004488",resignationAcceptance:"completed",proposedDOJ:"2026-06-15",owner:"Chandni",joiningStatus:"Offered",ctc:30000,statusCode:"Orange",notes:"",createdAt:"2026-05-26",updatedAt:"2026-05-26",deleted:false },
  { id:346,sn:346,client:"Elofic Industries",designation:"OEM Sales Head",location:"Faridabdad",name:"Hoshiyar Singh",actualDOJ:"",offerMonth:"2026-05-26",phone:"8527593644",resignationAcceptance:"completed",proposedDOJ:"16 th july",owner:"Harshita",joiningStatus:"Offered",ctc:189000,statusCode:"Orange",notes:"",createdAt:"2026-05-26",updatedAt:"2026-05-26",deleted:false },
  { id:347,sn:347,client:"Purflux",designation:"QMS Manager",location:"Manesar",name:"Deepak Sahu",actualDOJ:"",offerMonth:"2026-05-26",phone:"7404902830",resignationAcceptance:"completed",proposedDOJ:"2026-06-29",owner:"Chandni",joiningStatus:"Offered",ctc:120000,statusCode:"Orange",notes:"",createdAt:"2026-05-26",updatedAt:"2026-05-26",deleted:false },
  { id:348,sn:348,client:"CMR",designation:"Sr. executive Mechanical maintinance",location:"Orissa",name:"Anubhav deb",actualDOJ:"",offerMonth:"2026-05-26",phone:"7602958139",resignationAcceptance:"pending",proposedDOJ:"2026-07-15",owner:"Puja",joiningStatus:"Offered",ctc:40000,statusCode:"Orange",notes:"",createdAt:"2026-05-26",updatedAt:"2026-05-26",deleted:false },
  { id:349,sn:349,client:"Purflux",designation:"CMM executive",location:"Manesar",name:"Ved prakash",actualDOJ:"",offerMonth:"2026-05-26",phone:"7080434606",resignationAcceptance:"pending",proposedDOJ:"2026-06-28",owner:"Pallavi",joiningStatus:"Offered",ctc:40000,statusCode:"Orange",notes:"",createdAt:"2026-05-26",updatedAt:"2026-05-26",deleted:false },
  { id:350,sn:350,client:"Purflux",designation:"AM  -supplier quality",location:"Manesar",name:"Naresh kumar",actualDOJ:"1 st june",offerMonth:"2026-05-26",phone:"9818656430",resignationAcceptance:"completed",proposedDOJ:"1st june",owner:"Sarojni",joiningStatus:"Joined",ctc:110000,statusCode:"Brown",notes:"",createdAt:"2026-05-26",updatedAt:"2026-05-26",deleted:false }
];

// ─── UTILITY ──────────────────────────────────────────────────────────────────
const fmt = (n) => n?.toLocaleString("en-IN") ?? "—";
const fmtDate = (d) => {
  if (!d) return "—";
  try { return new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}); }
  catch { return d; }
};
const today = new Date();
const thisMonth = today.getMonth();
const thisYear = today.getFullYear();

const STATUS_COLOR = {
  Joined:"#22c55e", Offered:"#f97316", offered:"#f97316", Backout:"#ef4444",
  Left:"#8b5cf6", Rejected:"#dc2626", Hold:"#eab308", Cancelled:"#6b7280",
};
const STATUS_BG = {
  Joined:"#dcfce7", Offered:"#ffedd5", offered:"#ffedd5", Backout:"#fee2e2",
  Left:"#ede9fe", Rejected:"#fee2e2", Hold:"#fef9c3", Cancelled:"#f3f4f6",
};

function Badge({ status, code }) {
  if (code) {
    const found = INITIAL_MASTERS.statusCodes.find(s=>s.code===code);
    const color = found?.color || "#6b7280";
    return <span style={{background:color+"22",color,border:`1px solid ${color}44`,padding:"2px 8px",borderRadius:12,fontSize:11,fontWeight:600,letterSpacing:.3}}>{code}</span>;
  }
  const color = STATUS_COLOR[status]||"#6b7280";
  const bg = STATUS_BG[status]||"#f3f4f6";
  return <span style={{background:bg,color,padding:"2px 8px",borderRadius:12,fontSize:11,fontWeight:600,letterSpacing:.3}}>{status||"—"}</span>;
}

// ─── ICONS ────────────────────────────────────────────────────────────────────
const Icon = ({ name, size=16 }) => {
  const icons = {
    dashboard: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
    users: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
    settings: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/></svg>,
    plus: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
    search: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
    edit: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
    trash: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>,
    eye: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>,
    download: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
    upload: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>,
    bell: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
    chevronDown: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polyline points="6 9 12 15 18 9"/></svg>,
    x: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
    filter: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>,
    chart: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
    logout: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>,
    menu: <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>,
  };
  return icons[name] || null;
};

// ─── MINI CHART ───────────────────────────────────────────────────────────────
function MiniBar({ data, height=60 }) {
  if (!data?.length) return null;
  const max = Math.max(...data.map(d=>d.value), 1);
  return (
    <div style={{display:"flex",alignItems:"flex-end",gap:4,height,paddingTop:4}}>
      {data.map((d,i)=>(
        <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}>
          <div style={{width:"100%",background:d.color||"#3b82f6",borderRadius:"3px 3px 0 0",height:Math.max(4,(d.value/max)*(height-20)),transition:"height .3s"}}/>
          <span style={{fontSize:9,color:"#94a3b8",textAlign:"center",lineHeight:1}}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function DonutChart({ data, size=100 }) {
  const total = data.reduce((a,b)=>a+b.value,0)||1;
  let cum = 0;
  const slices = data.map(d=>{
    const pct = d.value/total;
    const start = cum; cum += pct;
    return {...d, start, pct};
  });
  const polarToCart = (cx,cy,r,angle) => ({
    x: cx + r * Math.cos(angle - Math.PI/2),
    y: cy + r * Math.sin(angle - Math.PI/2),
  });
  const r=40, cx=50, cy=50;
  return (
    <svg width={size} height={size} viewBox="0 0 100 100">
      {slices.map((s,i)=>{
        if(s.pct===0) return null;
        const startAngle = s.start * 2 * Math.PI;
        const endAngle = (s.start + s.pct) * 2 * Math.PI;
        const p1 = polarToCart(cx,cy,r,startAngle);
        const p2 = polarToCart(cx,cy,r,endAngle);
        const large = s.pct > 0.5 ? 1 : 0;
        return <path key={i} d={`M${cx},${cy} L${p1.x},${p1.y} A${r},${r} 0 ${large},1 ${p2.x},${p2.y} Z`} fill={s.color} opacity={0.9}/>;
      })}
      <circle cx={cx} cy={cy} r={26} fill="white"/>
      <text x={cx} y={cy+1} textAnchor="middle" dominantBaseline="middle" fontSize={14} fontWeight={700} fill="#1e293b">{total}</text>
      <text x={cx} y={cy+11} textAnchor="middle" dominantBaseline="middle" fontSize={7} fill="#94a3b8">TOTAL</text>
    </svg>
  );
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────
const USERS = [
  { id:1, name:"Admin User", email:"admin@ampleleap.com", password:"admin123", role:"admin" },
  { id:2, name:"Recruiter", email:"recruiter@ampleleap.com", password:"rec123", role:"recruiter" },
  { id:3, name:"Viewer", email:"viewer@ampleleap.com", password:"view123", role:"viewer" },
];

function LoginScreen({ onLogin }) {
  const [email,setEmail]=useState("admin@ampleleap.com");
  const [password,setPassword]=useState("admin123");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);

  const handle = (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    setTimeout(()=>{
      const u = USERS.find(u=>u.email===email&&u.password===password);
      if(u) onLogin(u);
      else { setError("Invalid credentials. Try admin@ampleleap.com / admin123"); setLoading(false); }
    },600);
  };

  return (
    <div style={{minHeight:"100vh",background:"linear-gradient(135deg,#0f172a 0%,#1e3a5f 50%,#0f172a 100%)",display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"'Inter',system-ui,sans-serif"}}>
      <div style={{background:"white",borderRadius:20,padding:"48px 40px",width:420,boxShadow:"0 25px 50px rgba(0,0,0,.4)"}}>
        <div style={{textAlign:"center",marginBottom:32}}>
          <div style={{width:56,height:56,background:"linear-gradient(135deg,#2563eb,#7c3aed)",borderRadius:16,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 16px",boxShadow:"0 8px 24px #2563eb44"}}>
            <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <h1 style={{fontSize:24,fontWeight:800,color:"#0f172a",margin:0}}>Ample Leap CRM</h1>
          <p style={{color:"#64748b",marginTop:4,fontSize:14}}>Recruitment Joining Tracker</p>
        </div>
        {error && <div style={{background:"#fee2e2",color:"#991b1b",padding:"10px 14px",borderRadius:8,fontSize:13,marginBottom:16}}>{error}</div>}
        <form onSubmit={handle}>
          <label style={{display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:4}}>Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} type="email" required style={{width:"100%",padding:"10px 14px",borderRadius:8,border:"1.5px solid #e2e8f0",fontSize:14,marginBottom:16,boxSizing:"border-box",outline:"none"}} />
          <label style={{display:"block",fontSize:13,fontWeight:600,color:"#374151",marginBottom:4}}>Password</label>
          <input value={password} onChange={e=>setPassword(e.target.value)} type="password" required style={{width:"100%",padding:"10px 14px",borderRadius:8,border:"1.5px solid #e2e8f0",fontSize:14,marginBottom:24,boxSizing:"border-box",outline:"none"}} />
          <button type="submit" disabled={loading} style={{width:"100%",padding:"12px",background:"linear-gradient(135deg,#2563eb,#7c3aed)",color:"white",border:"none",borderRadius:10,fontWeight:700,fontSize:15,cursor:"pointer",opacity:loading?.7:1}}>
            {loading?"Signing in…":"Sign In"}
          </button>
        </form>
        <div style={{marginTop:20,padding:14,background:"#f8fafc",borderRadius:8,fontSize:12,color:"#64748b"}}>
          <strong>Demo logins:</strong><br/>
          Admin: admin@ampleleap.com / admin123<br/>
          Recruiter: recruiter@ampleleap.com / rec123<br/>
          Viewer: viewer@ampleleap.com / view123
        </div>
      </div>
    </div>
  );
}

// ─── MODAL ────────────────────────────────────────────────────────────────────
function Modal({ open, onClose, title, children, wide }) {
  if (!open) return null;
  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:1000,display:"flex",alignItems:"center",justifyContent:"center",padding:16}} onClick={onClose}>
      <div style={{background:"white",borderRadius:16,width:"100%",maxWidth:wide?860:560,maxHeight:"90vh",overflow:"auto",boxShadow:"0 25px 50px rgba(0,0,0,.3)"}} onClick={e=>e.stopPropagation()}>
        <div style={{padding:"20px 24px",borderBottom:"1px solid #f1f5f9",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <h3 style={{margin:0,fontSize:18,fontWeight:700,color:"#0f172a"}}>{title}</h3>
          <button onClick={onClose} style={{background:"#f1f5f9",border:"none",borderRadius:8,padding:6,cursor:"pointer",display:"flex"}}>
            <Icon name="x" size={16}/>
          </button>
        </div>
        <div style={{padding:24}}>{children}</div>
      </div>
    </div>
  );
}

// ─── CANDIDATE FORM ───────────────────────────────────────────────────────────
function CandidateForm({ initial, masters, onSave, onCancel }) {
  const blank = { client:"", designation:"", location:"", name:"", actualDOJ:"", offerMonth:"", phone:"", resignationAcceptance:"Pending", proposedDOJ:"", owner:"", joiningStatus:"Offered", ctc:"", statusCode:"Orange", notes:"" };
  const [form,setForm] = useState(initial || blank);
  const set = (k,v) => setForm(f=>({...f,[k]:v}));
  const field = (label,key,type="text",placeholder="") => (
    <div style={{marginBottom:16}}>
      <label style={{display:"block",fontSize:12,fontWeight:600,color:"#475569",marginBottom:4,textTransform:"uppercase",letterSpacing:.5}}>{label}</label>
      <input type={type} value={form[key]||""} onChange={e=>set(key,e.target.value)} placeholder={placeholder}
        style={{width:"100%",padding:"9px 12px",borderRadius:8,border:"1.5px solid #e2e8f0",fontSize:14,boxSizing:"border-box",outline:"none"}} />
    </div>
  );
  const select = (label,key,opts) => (
    <div style={{marginBottom:16}}>
      <label style={{display:"block",fontSize:12,fontWeight:600,color:"#475569",marginBottom:4,textTransform:"uppercase",letterSpacing:.5}}>{label}</label>
      <select value={form[key]||""} onChange={e=>set(key,e.target.value)}
        style={{width:"100%",padding:"9px 12px",borderRadius:8,border:"1.5px solid #e2e8f0",fontSize:14,boxSizing:"border-box",outline:"none",background:"white"}}>
        <option value="">— Select —</option>
        {opts.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"0 16px"}}>
        {select("Client Name","client",masters.clients)}
        {field("Designation / Position","designation","text","e.g. Senior Manager")}
        {field("Location","location","text","e.g. Mumbai")}
        {field("Candidate Name","name","text","Full name")}
        {field("Phone No.","phone","tel","10-digit number")}
        {field("CTC Per Month (₹)","ctc","number","e.g. 85000")}
        {field("Offer Month","offerMonth","date")}
        {field("Proposed Date of Joining","proposedDOJ","date")}
        {field("Actual Date of Joining","actualDOJ","date")}
        {select("Resignation Acceptance","resignationAcceptance",masters.resignationStatus)}
        {select("Owner Name","owner",masters.owners)}
        {select("Joining Status","joiningStatus",masters.joiningStatus)}
        {select("Status Code","statusCode",masters.statusCodes.map(s=>s.code))}
      </div>
      <div style={{marginBottom:16}}>
        <label style={{display:"block",fontSize:12,fontWeight:600,color:"#475569",marginBottom:4,textTransform:"uppercase",letterSpacing:.5}}>Notes</label>
        <textarea value={form.notes||""} onChange={e=>set("notes",e.target.value)} rows={3}
          style={{width:"100%",padding:"9px 12px",borderRadius:8,border:"1.5px solid #e2e8f0",fontSize:14,boxSizing:"border-box",outline:"none",resize:"vertical"}} />
      </div>
      <div style={{display:"flex",gap:10,justifyContent:"flex-end"}}>
        <button onClick={onCancel} style={{padding:"10px 20px",background:"#f1f5f9",border:"none",borderRadius:8,fontWeight:600,cursor:"pointer",fontSize:14}}>Cancel</button>
        <button onClick={()=>onSave(form)} style={{padding:"10px 20px",background:"linear-gradient(135deg,#2563eb,#7c3aed)",color:"white",border:"none",borderRadius:8,fontWeight:600,cursor:"pointer",fontSize:14}}>Save Candidate</button>
      </div>
    </div>
  );
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function Dashboard({ candidates, masters }) {
  const active = candidates.filter(c=>!c.deleted);
  const joined = active.filter(c=>c.joiningStatus?.toLowerCase()==="joined");
  const offered = active.filter(c=>["offered","offered"].includes(c.joiningStatus?.toLowerCase()));
  const pending = active.filter(c=>c.resignationAcceptance?.toLowerCase()==="pending");
  const thisMonthJ = active.filter(c=>{
    if(!c.actualDOJ) return false;
    const d = new Date(c.actualDOJ);
    return d.getMonth()===thisMonth && d.getFullYear()===thisYear;
  });
  const nextMonthJ = active.filter(c=>{
    if(!c.proposedDOJ) return false;
    const d = new Date(c.proposedDOJ);
    const nm = (thisMonth+1)%12, ny = thisMonth===11?thisYear+1:thisYear;
    return d.getMonth()===nm && d.getFullYear()===ny;
  });

  const cards = [
    { label:"Total Candidates", value:active.length, color:"#2563eb", bg:"#eff6ff" },
    { label:"Offered", value:offered.length, color:"#f97316", bg:"#fff7ed" },
    { label:"Joined", value:joined.length, color:"#22c55e", bg:"#f0fdf4" },
    { label:"Resigned Pending", value:pending.length, color:"#ef4444", bg:"#fef2f2" },
    { label:"Joining This Month", value:thisMonthJ.length, color:"#8b5cf6", bg:"#f5f3ff" },
    { label:"Joining Next Month", value:nextMonthJ.length, color:"#06b6d4", bg:"#ecfeff" },
  ];

  // Status distribution
  const statusDist = masters.joiningStatus.map(s=>{
    const v = active.filter(c=>c.joiningStatus?.toLowerCase()===s.toLowerCase()).length;
    return { label:s, value:v, color:STATUS_COLOR[s]||"#94a3b8" };
  }).filter(x=>x.value>0);

  // Client distribution
  const clientDist = [...new Set(active.map(c=>c.client).filter(Boolean))].map(cl=>({
    label:cl.length>8?cl.slice(0,8)+"…":cl,
    value:active.filter(c=>c.client===cl).length,
    color:"#3b82f6"
  })).sort((a,b)=>b.value-a.value).slice(0,8);

  // Owner distribution
  const ownerDist = [...new Set(active.map(c=>c.owner).filter(Boolean))].map(o=>({
    label:o.length>8?o.slice(0,8)+"…":o,
    value:active.filter(c=>c.owner===o).length,
    color:"#8b5cf6"
  })).sort((a,b)=>b.value-a.value).slice(0,8);

  // Monthly trend
  const months = Array.from({length:6},(_,i)=>{
    const d = new Date(); d.setMonth(d.getMonth()-5+i);
    return { month:d.getMonth(), year:d.getFullYear(), label:d.toLocaleString("en-IN",{month:"short"}) };
  });
  const monthlyTrend = months.map(m=>({
    label:m.label,
    value:active.filter(c=>{
      if(!c.actualDOJ) return false;
      const d=new Date(c.actualDOJ);
      return d.getMonth()===m.month && d.getFullYear()===m.year;
    }).length,
    color:"#22c55e"
  }));

  // Upcoming joinings
  const upcoming = active.filter(c=>{
    if(!c.proposedDOJ) return false;
    const d = new Date(c.proposedDOJ);
    return d >= today && d <= new Date(today.getTime()+14*86400000);
  }).sort((a,b)=>new Date(a.proposedDOJ)-new Date(b.proposedDOJ));

  return (
    <div>
      <div style={{marginBottom:24}}>
        <h2 style={{fontSize:22,fontWeight:800,color:"#0f172a",margin:0}}>Dashboard</h2>
        <p style={{color:"#64748b",margin:"4px 0 0",fontSize:14}}>Real-time recruitment overview</p>
      </div>

      {/* KPI Cards */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:14,marginBottom:28}}>
        {cards.map(c=>(
          <div key={c.label} style={{background:"white",borderRadius:14,padding:18,boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #f1f5f9"}}>
            <div style={{fontSize:28,fontWeight:800,color:c.color}}>{c.value}</div>
            <div style={{fontSize:12,color:"#64748b",marginTop:2,fontWeight:500,lineHeight:1.3}}>{c.label}</div>
            <div style={{width:32,height:3,background:c.color,borderRadius:2,marginTop:10,opacity:.4}}/>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,marginBottom:28}}>
        <div style={{background:"white",borderRadius:14,padding:20,boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #f1f5f9"}}>
          <div style={{fontSize:13,fontWeight:700,color:"#0f172a",marginBottom:8}}>Joining Status Distribution</div>
          <div style={{display:"flex",alignItems:"center",gap:16}}>
            <DonutChart data={statusDist} size={90}/>
            <div style={{flex:1}}>
              {statusDist.map(s=>(
                <div key={s.label} style={{display:"flex",alignItems:"center",gap:6,marginBottom:4}}>
                  <div style={{width:8,height:8,borderRadius:"50%",background:s.color,flexShrink:0}}/>
                  <span style={{fontSize:11,color:"#475569",flex:1}}>{s.label}</span>
                  <span style={{fontSize:11,fontWeight:700,color:"#0f172a"}}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{background:"white",borderRadius:14,padding:20,boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #f1f5f9"}}>
          <div style={{fontSize:13,fontWeight:700,color:"#0f172a",marginBottom:4}}>Client-wise Candidates</div>
          <MiniBar data={clientDist} height={80}/>
        </div>
        <div style={{background:"white",borderRadius:14,padding:20,boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #f1f5f9"}}>
          <div style={{fontSize:13,fontWeight:700,color:"#0f172a",marginBottom:4}}>Monthly Joining Trend</div>
          <MiniBar data={monthlyTrend} height={80}/>
        </div>
      </div>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
        {/* Upcoming joinings */}
        <div style={{background:"white",borderRadius:14,padding:20,boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #f1f5f9"}}>
          <div style={{fontSize:13,fontWeight:700,color:"#0f172a",marginBottom:12}}>⏰ Upcoming Joinings (14 days)</div>
          {upcoming.length===0 ? <div style={{color:"#94a3b8",fontSize:13}}>No upcoming joinings in the next 14 days.</div> :
            upcoming.map(c=>(
              <div key={c.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #f8fafc"}}>
                <div>
                  <div style={{fontSize:13,fontWeight:600,color:"#0f172a"}}>{c.name}</div>
                  <div style={{fontSize:11,color:"#94a3b8"}}>{c.client} · {c.designation}</div>
                </div>
                <div style={{fontSize:12,color:"#f97316",fontWeight:600}}>{fmtDate(c.proposedDOJ)}</div>
              </div>
            ))
          }
        </div>
        {/* Owner distribution */}
        <div style={{background:"white",borderRadius:14,padding:20,boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #f1f5f9"}}>
          <div style={{fontSize:13,fontWeight:700,color:"#0f172a",marginBottom:8}}>Owner-wise Candidates</div>
          <MiniBar data={ownerDist} height={80}/>
          <div style={{marginTop:12}}>
            {ownerDist.map(o=>(
              <div key={o.label} style={{display:"flex",justifyContent:"space-between",fontSize:12,color:"#475569",padding:"3px 0"}}>
                <span>{o.label}</span><span style={{fontWeight:700,color:"#0f172a"}}>{o.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CANDIDATES TABLE ─────────────────────────────────────────────────────────
function CandidatesPage({ candidates, masters, user, onAdd, onEdit, onDelete, onView }) {
  const [search,setSearch]=useState("");
  const [filters,setFilters]=useState({client:"",owner:"",status:"",statusCode:"",location:"",dateFrom:"",dateTo:""});
  const [sort,setSort]=useState({key:"sn",dir:1});
  const [showAll,setShowAll]=useState(false);
  const PER = 50;
  const [page,setPage]=useState(1);

  const setFilter = (k,v) => { setFilters(f=>({...f,[k]:v})); setPage(1); };
  const clearAll = () => { setFilters({client:"",owner:"",status:"",statusCode:"",location:"",dateFrom:"",dateTo:""}); setSearch(""); setPage(1); };

  const filtered = useMemo(()=>{
    let r = candidates.filter(c=>!c.deleted);
    if(search) {
      const q = search.toLowerCase();
      r = r.filter(c=>[c.name,c.client,c.designation,c.location,c.phone,c.owner].some(x=>x?.toLowerCase().includes(q)));
    }
    if(filters.client) r=r.filter(c=>c.client===filters.client);
    if(filters.owner) r=r.filter(c=>c.owner===filters.owner);
    if(filters.status) r=r.filter(c=>c.joiningStatus?.toLowerCase()===filters.status.toLowerCase());
    if(filters.statusCode) r=r.filter(c=>c.statusCode===filters.statusCode);
    if(filters.location) r=r.filter(c=>c.location?.toLowerCase().includes(filters.location.toLowerCase()));
    if(filters.dateFrom) r=r.filter(c=>c.offerMonth&&c.offerMonth>=filters.dateFrom);
    if(filters.dateTo) r=r.filter(c=>c.offerMonth&&c.offerMonth<=filters.dateTo);
    r = [...r].sort((a,b)=>{
      const av=a[sort.key], bv=b[sort.key];
      if(av==null) return 1; if(bv==null) return -1;
      return (av>bv?1:-1)*sort.dir;
    });
    return r;
  },[candidates,search,filters,sort]);

  const activeFiltersCount = Object.values(filters).filter(Boolean).length + (search?1:0);
  const pages = showAll ? 1 : Math.ceil(filtered.length/PER)||1;
  const shown = showAll ? filtered : filtered.slice((page-1)*PER, page*PER);

  const toggleSort = (k) => setSort(s=>s.key===k?{key:k,dir:-s.dir}:{key:k,dir:1});
  const SortArrow = ({k})=><span style={{color:"#94a3b8",fontSize:10,marginLeft:2}}>{sort.key===k?(sort.dir===1?"▲":"▼"):"⇅"}</span>;

  const canEdit = user.role!=="viewer";
  const canDelete = user.role==="admin";

  const exportCSV = () => {
    const cols = ["SN","Client","Designation","Location","Candidate Name","Phone","Offer Month","Proposed DOJ","Actual DOJ","Resignation","Owner","Status","CTC","Code","Notes"];
    const rows = filtered.map(c=>[c.sn,c.client,c.designation,c.location,c.name,c.phone,c.offerMonth,c.proposedDOJ,c.actualDOJ,c.resignationAcceptance,c.owner,c.joiningStatus,c.ctc,c.statusCode,c.notes]);
    const csv = [cols,...rows].map(r=>r.map(v=>`"${v||""}"`).join(",")).join("\n");
    const a=document.createElement("a"); a.href="data:text/csv;charset=utf-8,"+encodeURIComponent(csv); a.download="candidates.csv"; a.click();
  };

  const sel = (label,key,opts,minW=140) => (
    <div style={{display:"flex",flexDirection:"column",gap:3,minWidth:minW}}>
      <label style={{fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:.5}}>{label}</label>
      <select value={filters[key]} onChange={e=>setFilter(key,e.target.value)}
        style={{padding:"7px 10px",borderRadius:8,border:"1.5px solid "+(filters[key]?"#2563eb":"#e2e8f0"),fontSize:13,background:filters[key]?"#eff6ff":"white",outline:"none",color:"#0f172a",cursor:"pointer"}}>
        <option value="">All</option>
        {opts.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );

  return (
    <div style={{display:"flex",flexDirection:"column",gap:0,minHeight:"100vh"}}>
      {/* Header */}
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16,flexWrap:"wrap",gap:10}}>
        <div>
          <h2 style={{fontSize:22,fontWeight:800,color:"#0f172a",margin:0}}>Candidates</h2>
          <p style={{color:"#64748b",margin:"4px 0 0",fontSize:14}}>
            <span style={{fontWeight:700,color:"#2563eb"}}>{filtered.length}</span> of {candidates.filter(c=>!c.deleted).length} records
            {activeFiltersCount>0&&<span style={{marginLeft:6,fontSize:12,color:"#f97316",fontWeight:600}}>({activeFiltersCount} filter{activeFiltersCount>1?"s":""} active)</span>}
          </p>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {canEdit && <button onClick={onAdd} style={{display:"flex",alignItems:"center",gap:6,padding:"9px 16px",background:"linear-gradient(135deg,#2563eb,#7c3aed)",color:"white",border:"none",borderRadius:9,fontWeight:600,cursor:"pointer",fontSize:13}}>
            <Icon name="plus" size={14}/> Add Candidate
          </button>}
          <button onClick={exportCSV} style={{display:"flex",alignItems:"center",gap:6,padding:"9px 14px",background:"#f1f5f9",border:"none",borderRadius:9,fontWeight:600,cursor:"pointer",fontSize:13,color:"#374151"}}>
            <Icon name="download" size={14}/> Export CSV
          </button>
        </div>
      </div>

      {/* Filters Bar */}
      <div style={{background:"white",borderRadius:12,padding:"14px 16px",marginBottom:14,boxShadow:"0 1px 3px rgba(0,0,0,.07)",border:"1px solid #f1f5f9"}}>
        {/* Search row */}
        <div style={{display:"flex",gap:10,marginBottom:12,flexWrap:"wrap",alignItems:"flex-end"}}>
          <div style={{flex:"1 1 260px",display:"flex",flexDirection:"column",gap:3}}>
            <label style={{fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:.5}}>Search</label>
            <div style={{display:"flex",alignItems:"center",gap:8,background:"#f8fafc",borderRadius:8,padding:"7px 12px",border:"1.5px solid "+(search?"#2563eb":"#e2e8f0")}}>
              <Icon name="search" size={14}/><input value={search} onChange={e=>{setSearch(e.target.value);setPage(1);}} placeholder="Name, client, phone, designation…" style={{border:"none",background:"none",outline:"none",fontSize:13,width:"100%"}}/>
              {search&&<button onClick={()=>{setSearch("");setPage(1);}} style={{background:"none",border:"none",cursor:"pointer",color:"#94a3b8",display:"flex",padding:0}}><Icon name="x" size={12}/></button>}
            </div>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:3,minWidth:130}}>
            <label style={{fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:.5}}>Location</label>
            <div style={{display:"flex",alignItems:"center",gap:6,background:filters.location?"#eff6ff":"#f8fafc",borderRadius:8,padding:"7px 10px",border:"1.5px solid "+(filters.location?"#2563eb":"#e2e8f0")}}>
              <input value={filters.location} onChange={e=>setFilter("location",e.target.value)} placeholder="City…" style={{border:"none",background:"none",outline:"none",fontSize:13,width:"100%"}}/>
              {filters.location&&<button onClick={()=>setFilter("location","")} style={{background:"none",border:"none",cursor:"pointer",color:"#94a3b8",display:"flex",padding:0}}><Icon name="x" size={12}/></button>}
            </div>
          </div>
          {activeFiltersCount>0&&<button onClick={clearAll} style={{padding:"7px 14px",borderRadius:8,border:"1.5px solid #fecaca",background:"#fef2f2",color:"#dc2626",fontSize:13,fontWeight:700,cursor:"pointer",alignSelf:"flex-end"}}>✕ Clear All</button>}
        </div>

        {/* Dropdown filters row */}
        <div style={{display:"flex",gap:10,flexWrap:"wrap",alignItems:"flex-end"}}>
          {sel("Client","client",masters.clients,160)}
          {sel("Owner","owner",masters.owners,130)}
          {sel("Joining Status","status",masters.joiningStatus,130)}
          {sel("Status Code","statusCode",masters.statusCodes.map(s=>s.code),110)}
          <div style={{display:"flex",flexDirection:"column",gap:3,minWidth:130}}>
            <label style={{fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:.5}}>Offer From</label>
            <input type="date" value={filters.dateFrom} onChange={e=>setFilter("dateFrom",e.target.value)}
              style={{padding:"7px 10px",borderRadius:8,border:"1.5px solid "+(filters.dateFrom?"#2563eb":"#e2e8f0"),fontSize:13,background:filters.dateFrom?"#eff6ff":"white",outline:"none",color:"#0f172a",cursor:"pointer"}}/>
          </div>
          <div style={{display:"flex",flexDirection:"column",gap:3,minWidth:130}}>
            <label style={{fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:.5}}>Offer To</label>
            <input type="date" value={filters.dateTo} onChange={e=>setFilter("dateTo",e.target.value)}
              style={{padding:"7px 10px",borderRadius:8,border:"1.5px solid "+(filters.dateTo?"#2563eb":"#e2e8f0"),fontSize:13,background:filters.dateTo?"#eff6ff":"white",outline:"none",color:"#0f172a",cursor:"pointer"}}/>
          </div>
          <div style={{display:"flex",gap:6,alignItems:"flex-end",marginLeft:"auto"}}>
            <button onClick={()=>{setShowAll(v=>!v);setPage(1);}}
              style={{padding:"7px 14px",borderRadius:8,border:"1.5px solid "+(showAll?"#7c3aed":"#e2e8f0"),background:showAll?"#f5f3ff":"white",color:showAll?"#7c3aed":"#374151",fontSize:13,fontWeight:600,cursor:"pointer",whiteSpace:"nowrap"}}>
              {showAll?`Showing all ${filtered.length}`:`Show all ${filtered.length}`}
            </button>
          </div>
        </div>
      </div>

      {/* Status code legend */}
      <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:10}}>
        {masters.statusCodes.map(s=>(
          <button key={s.code} onClick={()=>setFilter("statusCode",filters.statusCode===s.code?"":s.code)}
            style={{display:"flex",alignItems:"center",gap:5,padding:"3px 10px",borderRadius:20,border:`1.5px solid ${filters.statusCode===s.code?s.color:s.color+"55"}`,background:filters.statusCode===s.code?s.color+"22":"white",cursor:"pointer",fontSize:11,fontWeight:600,color:s.color,transition:"all .15s"}}>
            <div style={{width:8,height:8,borderRadius:"50%",background:s.color}}/>{s.code}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{background:"white",borderRadius:12,boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #f1f5f9",overflow:"auto",flex:1}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead>
            <tr style={{background:"#f8fafc",borderBottom:"1.5px solid #e2e8f0",position:"sticky",top:0,zIndex:2}}>
              {[["sn","#",40],["client","Client",130],["name","Candidate",140],["designation","Position",130],["location","Location",90],["offerMonth","Offer Month",110],["proposedDOJ","Proposed DOJ",110],["actualDOJ","Actual DOJ",110],["owner","Owner",100],["joiningStatus","Status",100],["ctc","CTC/Mo",90],["statusCode","Code",70]].map(([k,l,w])=>(
                <th key={k} onClick={()=>toggleSort(k)} style={{padding:"10px 12px",textAlign:"left",fontWeight:700,color:"#475569",cursor:"pointer",userSelect:"none",fontSize:11,textTransform:"uppercase",letterSpacing:.4,minWidth:w,whiteSpace:"nowrap"}}>
                  {l}<SortArrow k={k}/>
                </th>
              ))}
              <th style={{padding:"10px 12px",width:90}}></th>
            </tr>
          </thead>
          <tbody>
            {shown.length===0 && <tr><td colSpan={13} style={{padding:40,textAlign:"center",color:"#94a3b8"}}>No candidates found. Try adjusting your filters.</td></tr>}
            {shown.map((c,i)=>(
              <tr key={c.id} style={{borderBottom:"1px solid #f8fafc",background:i%2===0?"white":"#fcfcfd"}}
                onMouseEnter={e=>e.currentTarget.style.background="#f0f9ff"}
                onMouseLeave={e=>e.currentTarget.style.background=i%2===0?"white":"#fcfcfd"}>
                <td style={{padding:"9px 12px",color:"#94a3b8",fontWeight:600,fontSize:12}}>{c.sn}</td>
                <td style={{padding:"9px 12px",fontWeight:600,color:"#1e293b",maxWidth:160,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.client||"—"}</td>
                <td style={{padding:"9px 12px"}}>
                  <div style={{fontWeight:600,color:"#0f172a"}}>{c.name}</div>
                  {c.phone&&<div style={{fontSize:11,color:"#94a3b8",fontFamily:"monospace"}}>{c.phone}</div>}
                </td>
                <td style={{padding:"9px 12px",color:"#475569",maxWidth:150,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{c.designation||"—"}</td>
                <td style={{padding:"9px 12px",color:"#475569"}}>{c.location||"—"}</td>
                <td style={{padding:"9px 12px",color:"#64748b",whiteSpace:"nowrap"}}>{fmtDate(c.offerMonth)}</td>
                <td style={{padding:"9px 12px",color:"#64748b",whiteSpace:"nowrap"}}>{fmtDate(c.proposedDOJ)}</td>
                <td style={{padding:"9px 12px",color:"#64748b",whiteSpace:"nowrap"}}>{fmtDate(c.actualDOJ)}</td>
                <td style={{padding:"9px 12px",color:"#475569"}}>{c.owner||"—"}</td>
                <td style={{padding:"9px 12px"}}><Badge status={c.joiningStatus}/></td>
                <td style={{padding:"9px 12px",color:"#0f172a",fontWeight:600,whiteSpace:"nowrap"}}>₹{fmt(c.ctc)}</td>
                <td style={{padding:"9px 12px"}}><Badge code={c.statusCode}/></td>
                <td style={{padding:"9px 12px"}}>
                  <div style={{display:"flex",gap:4}}>
                    <button onClick={()=>onView(c)} style={{padding:5,background:"#f0f9ff",border:"none",borderRadius:6,cursor:"pointer",color:"#2563eb",display:"flex"}} title="View"><Icon name="eye" size={13}/></button>
                    {canEdit&&<button onClick={()=>onEdit(c)} style={{padding:5,background:"#f0fdf4",border:"none",borderRadius:6,cursor:"pointer",color:"#16a34a",display:"flex"}} title="Edit"><Icon name="edit" size={13}/></button>}
                    {canDelete&&<button onClick={()=>onDelete(c.id)} style={{padding:5,background:"#fef2f2",border:"none",borderRadius:6,cursor:"pointer",color:"#dc2626",display:"flex"}} title="Delete"><Icon name="trash" size={13}/></button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination (only shown when not showing all) */}
      {!showAll && pages > 1 && (
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:12,flexWrap:"wrap",gap:8}}>
          <span style={{fontSize:13,color:"#64748b"}}>
            Showing {Math.min((page-1)*PER+1,filtered.length)}–{Math.min(page*PER,filtered.length)} of {filtered.length}
            <span style={{marginLeft:8,color:"#94a3b8"}}>· {PER} per page</span>
          </span>
          <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
            <button onClick={()=>setPage(1)} disabled={page===1} style={{padding:"5px 10px",borderRadius:7,border:"1.5px solid #e2e8f0",background:"white",color:page===1?"#cbd5e1":"#374151",cursor:page===1?"default":"pointer",fontSize:12,fontWeight:600}}>«</button>
            <button onClick={()=>setPage(p=>Math.max(1,p-1))} disabled={page===1} style={{padding:"5px 10px",borderRadius:7,border:"1.5px solid #e2e8f0",background:"white",color:page===1?"#cbd5e1":"#374151",cursor:page===1?"default":"pointer",fontSize:12,fontWeight:600}}>‹</button>
            {Array.from({length:Math.min(7,pages)},(_,i)=>{
              let p; const half=3;
              if(pages<=7) p=i+1;
              else if(page<=half+1) p=i+1;
              else if(page>=pages-half) p=pages-6+i;
              else p=page-half+i;
              return <button key={p} onClick={()=>setPage(p)} style={{width:32,height:32,borderRadius:7,border:"1.5px solid "+(p===page?"#2563eb":"#e2e8f0"),background:p===page?"#2563eb":"white",color:p===page?"white":"#374151",fontWeight:600,cursor:"pointer",fontSize:13}}>{p}</button>;
            })}
            <button onClick={()=>setPage(p=>Math.min(pages,p+1))} disabled={page===pages} style={{padding:"5px 10px",borderRadius:7,border:"1.5px solid #e2e8f0",background:"white",color:page===pages?"#cbd5e1":"#374151",cursor:page===pages?"default":"pointer",fontSize:12,fontWeight:600}}>›</button>
            <button onClick={()=>setPage(pages)} disabled={page===pages} style={{padding:"5px 10px",borderRadius:7,border:"1.5px solid #e2e8f0",background:"white",color:page===pages?"#cbd5e1":"#374151",cursor:page===pages?"default":"pointer",fontSize:12,fontWeight:600}}>»</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── VIEW CANDIDATE ───────────────────────────────────────────────────────────
function ViewCandidate({ candidate: c }) {
  if(!c) return null;
  const row = (label,value) => (
    <div style={{display:"flex",borderBottom:"1px solid #f8fafc",padding:"10px 0"}}>
      <div style={{width:180,fontSize:12,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:.4,flexShrink:0}}>{label}</div>
      <div style={{fontSize:14,color:"#0f172a",fontWeight:500}}>{value||"—"}</div>
    </div>
  );
  const statusInfo = INITIAL_MASTERS.statusCodes.find(s=>s.code===c.statusCode);
  return (
    <div>
      <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:20,paddingBottom:20,borderBottom:"1px solid #f1f5f9"}}>
        <div style={{width:56,height:56,borderRadius:14,background:"linear-gradient(135deg,#2563eb22,#7c3aed22)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:800,color:"#2563eb"}}>
          {c.name?.[0]?.toUpperCase()}
        </div>
        <div>
          <h3 style={{margin:0,fontSize:20,fontWeight:800,color:"#0f172a"}}>{c.name}</h3>
          <p style={{margin:"2px 0 0",color:"#64748b",fontSize:13}}>{c.designation} · {c.client}</p>
          <div style={{display:"flex",gap:6,marginTop:6}}><Badge status={c.joiningStatus}/><Badge code={c.statusCode}/></div>
        </div>
      </div>
      {statusInfo && <div style={{background:statusInfo.color+"11",border:`1px solid ${statusInfo.color}33`,borderRadius:8,padding:"8px 14px",marginBottom:16,fontSize:13,color:statusInfo.color,fontWeight:600}}>
        ● {statusInfo.label}
      </div>}
      {row("Client", c.client)}
      {row("Designation", c.designation)}
      {row("Location", c.location)}
      {row("Phone", c.phone)}
      {row("Offer Month", fmtDate(c.offerMonth))}
      {row("Proposed DOJ", fmtDate(c.proposedDOJ))}
      {row("Actual DOJ", fmtDate(c.actualDOJ))}
      {row("Resignation Acceptance", c.resignationAcceptance)}
      {row("Owner", c.owner)}
      {row("CTC Per Month", c.ctc ? `₹${fmt(c.ctc)}` : "—")}
      {row("Notes", c.notes)}
    </div>
  );
}

// ─── MASTER DATA PAGE ─────────────────────────────────────────────────────────
function MastersPage({ masters, setMasters }) {
  const [activeTab,setActiveTab]=useState("clients");
  const [newVal,setNewVal]=useState("");

  const tabs = [
    { key:"clients", label:"Clients" },
    { key:"owners", label:"Owners" },
    { key:"joiningStatus", label:"Joining Status" },
    { key:"resignationStatus", label:"Resignation Status" },
  ];

  const addItem = () => {
    if(!newVal.trim()) return;
    setMasters(m=>({...m,[activeTab]:[...m[activeTab],newVal.trim()]}));
    setNewVal("");
  };
  const removeItem = (i) => setMasters(m=>({...m,[activeTab]:m[activeTab].filter((_,idx)=>idx!==i)}));

  return (
    <div>
      <h2 style={{fontSize:22,fontWeight:800,color:"#0f172a",margin:"0 0 4px"}}>Master Data</h2>
      <p style={{color:"#64748b",margin:"0 0 20px",fontSize:14}}>Manage dropdown options used across the application.</p>

      <div style={{display:"flex",gap:6,marginBottom:20,flexWrap:"wrap"}}>
        {tabs.map(t=>(
          <button key={t.key} onClick={()=>setActiveTab(t.key)} style={{padding:"8px 16px",borderRadius:8,border:"1.5px solid "+(activeTab===t.key?"#2563eb":"#e2e8f0"),background:activeTab===t.key?"#2563eb":"white",color:activeTab===t.key?"white":"#374151",fontWeight:600,cursor:"pointer",fontSize:13}}>
            {t.label}
          </button>
        ))}
      </div>

      <div style={{background:"white",borderRadius:14,padding:24,boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #f1f5f9",maxWidth:540}}>
        <div style={{display:"flex",gap:8,marginBottom:20}}>
          <input value={newVal} onChange={e=>setNewVal(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addItem()} placeholder={`Add new ${tabs.find(t=>t.key===activeTab)?.label?.slice(0,-1)}…`}
            style={{flex:1,padding:"9px 14px",borderRadius:8,border:"1.5px solid #e2e8f0",fontSize:14,outline:"none"}}/>
          <button onClick={addItem} style={{padding:"9px 16px",background:"#2563eb",color:"white",border:"none",borderRadius:8,fontWeight:700,cursor:"pointer",fontSize:13,display:"flex",alignItems:"center",gap:5}}>
            <Icon name="plus" size={14}/> Add
          </button>
        </div>
        <div>
          {masters[activeTab]?.map((item,i)=>(
            <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 14px",background:"#f8fafc",borderRadius:8,marginBottom:6}}>
              <span style={{fontSize:14,color:"#1e293b",fontWeight:500}}>{item}</span>
              <button onClick={()=>removeItem(i)} style={{padding:4,background:"#fef2f2",border:"none",borderRadius:6,cursor:"pointer",color:"#ef4444",display:"flex"}}>
                <Icon name="x" size={13}/>
              </button>
            </div>
          ))}
          {masters[activeTab]?.length===0 && <div style={{textAlign:"center",color:"#94a3b8",padding:20}}>No items yet.</div>}
        </div>
      </div>

      {/* Status Codes (read-only reference) */}
      <div style={{marginTop:24}}>
        <h3 style={{fontSize:15,fontWeight:700,color:"#0f172a",marginBottom:12}}>Status Code Reference</h3>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:10}}>
          {masters.statusCodes.map(s=>(
            <div key={s.code} style={{background:"white",borderRadius:10,padding:"12px 16px",border:`2px solid ${s.color}33`,display:"flex",alignItems:"center",gap:10}}>
              <div style={{width:14,height:14,borderRadius:"50%",background:s.color,flexShrink:0}}/>
              <div>
                <div style={{fontWeight:700,fontSize:13,color:s.color}}>{s.code}</div>
                <div style={{fontSize:11,color:"#64748b",marginTop:1}}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── REPORTS PAGE ─────────────────────────────────────────────────────────────
function ReportsPage({ candidates }) {
  const active = candidates.filter(c=>!c.deleted);

  const byStatus = INITIAL_MASTERS.joiningStatus.map(s=>({
    status: s,
    count: active.filter(c=>c.joiningStatus?.toLowerCase()===s.toLowerCase()).length,
    totalCTC: active.filter(c=>c.joiningStatus?.toLowerCase()===s.toLowerCase()).reduce((a,c)=>a+(+c.ctc||0),0),
  })).filter(x=>x.count>0);

  const byClient = [...new Set(active.map(c=>c.client).filter(Boolean))].map(cl=>{
    const group = active.filter(c=>c.client===cl);
    return { client:cl, count:group.length, joined:group.filter(c=>c.joiningStatus?.toLowerCase()==="joined").length, avgCTC:Math.round(group.reduce((a,c)=>a+(+c.ctc||0),0)/group.length)||0 };
  }).sort((a,b)=>b.count-a.count);

  return (
    <div>
      <h2 style={{fontSize:22,fontWeight:800,color:"#0f172a",margin:"0 0 4px"}}>Reports</h2>
      <p style={{color:"#64748b",margin:"0 0 20px",fontSize:14}}>Analytics and summary reports</p>

      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>
        <div style={{background:"white",borderRadius:14,padding:20,boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #f1f5f9"}}>
          <h3 style={{fontSize:15,fontWeight:700,color:"#0f172a",margin:"0 0 14px"}}>Status Summary</h3>
          <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
            <thead><tr style={{background:"#f8fafc"}}>
              {["Status","Count","Total CTC"].map(h=><th key={h} style={{padding:"8px 12px",textAlign:"left",fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:.4}}>{h}</th>)}
            </tr></thead>
            <tbody>{byStatus.map(r=>(
              <tr key={r.status} style={{borderTop:"1px solid #f1f5f9"}}>
                <td style={{padding:"9px 12px"}}><Badge status={r.status}/></td>
                <td style={{padding:"9px 12px",fontWeight:700,color:"#0f172a"}}>{r.count}</td>
                <td style={{padding:"9px 12px",color:"#16a34a",fontWeight:600}}>₹{fmt(r.totalCTC)}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>

        <div style={{background:"white",borderRadius:14,padding:20,boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #f1f5f9"}}>
          <h3 style={{fontSize:15,fontWeight:700,color:"#0f172a",margin:"0 0 14px"}}>Client-wise Summary</h3>
          <div style={{overflow:"auto",maxHeight:320}}>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
              <thead><tr style={{background:"#f8fafc"}}>
                {["Client","Total","Joined","Avg CTC"].map(h=><th key={h} style={{padding:"8px 12px",textAlign:"left",fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:.4}}>{h}</th>)}
              </tr></thead>
              <tbody>{byClient.map(r=>(
                <tr key={r.client} style={{borderTop:"1px solid #f1f5f9"}}>
                  <td style={{padding:"9px 12px",fontWeight:600,color:"#1e293b"}}>{r.client}</td>
                  <td style={{padding:"9px 12px",fontWeight:700}}>{r.count}</td>
                  <td style={{padding:"9px 12px",color:"#16a34a",fontWeight:600}}>{r.joined}</td>
                  <td style={{padding:"9px 12px",color:"#475569"}}>₹{fmt(r.avgCTC)}</td>
                </tr>
              ))}</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── AUDIT LOG PAGE ───────────────────────────────────────────────────────────
function AuditPage({ logs }) {
  return (
    <div>
      <h2 style={{fontSize:22,fontWeight:800,color:"#0f172a",margin:"0 0 4px"}}>Audit Log</h2>
      <p style={{color:"#64748b",margin:"0 0 20px",fontSize:14}}>Track all changes made to candidate records</p>
      <div style={{background:"white",borderRadius:14,overflow:"auto",boxShadow:"0 1px 3px rgba(0,0,0,.06)",border:"1px solid #f1f5f9"}}>
        <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
          <thead><tr style={{background:"#f8fafc",borderBottom:"1.5px solid #e2e8f0"}}>
            {["Time","User","Action","Record","Details"].map(h=><th key={h} style={{padding:"10px 14px",textAlign:"left",fontSize:11,fontWeight:700,color:"#64748b",textTransform:"uppercase",letterSpacing:.4}}>{h}</th>)}
          </tr></thead>
          <tbody>
            {logs.length===0&&<tr><td colSpan={5} style={{padding:40,textAlign:"center",color:"#94a3b8"}}>No audit logs yet.</td></tr>}
            {logs.map((l,i)=>(
              <tr key={i} style={{borderBottom:"1px solid #f8fafc"}}>
                <td style={{padding:"10px 14px",color:"#64748b",fontFamily:"monospace",fontSize:11,whiteSpace:"nowrap"}}>{l.time}</td>
                <td style={{padding:"10px 14px",fontWeight:600,color:"#1e293b"}}>{l.user}</td>
                <td style={{padding:"10px 14px"}}>
                  <span style={{padding:"2px 8px",borderRadius:10,fontSize:11,fontWeight:700,background:l.action==="Created"?"#dcfce7":l.action==="Deleted"?"#fee2e2":"#fef9c3",color:l.action==="Created"?"#16a34a":l.action==="Deleted"?"#dc2626":"#92400e"}}>
                    {l.action}
                  </span>
                </td>
                <td style={{padding:"10px 14px",color:"#475569"}}>{l.record}</td>
                <td style={{padding:"10px 14px",color:"#64748b",fontSize:12}}>{l.detail}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [user,setUser]=useState(null);
  const [page,setPage]=useState("dashboard");
  const [candidates,setCandidates]=useState(SEED_CANDIDATES);
  const [masters,setMasters]=useState(INITIAL_MASTERS);
  const [modal,setModal]=useState(null); // {type, data}
  const [auditLogs,setAuditLogs]=useState([]);
  const [nextId,setNextId]=useState(500);
  const [,setSidebarOpen]=useState(false);

  const log = useCallback((action,record,detail="") => {
    setAuditLogs(l=>[{time:new Date().toLocaleString("en-IN"),user:user?.name||"?",action,record,detail},...l].slice(0,100));
  },[user]);

  if(!user) return <LoginScreen onLogin={setUser}/>;

  const handleAdd = () => setModal({type:"add"});
  const handleEdit = (c) => setModal({type:"edit",data:c});
  const handleView = (c) => setModal({type:"view",data:c});
  const handleDelete = (id) => {
    if(!window.confirm("Delete this candidate?")) return;
    const c = candidates.find(x=>x.id===id);
    setCandidates(cs=>cs.map(x=>x.id===id?{...x,deleted:true}:x));
    log("Deleted",c?.name,"Soft deleted");
  };
  const handleSave = (form) => {
    if(modal.type==="add") {
      const sn = candidates.filter(c=>!c.deleted).length+1;
      const newC = {...form,id:nextId,sn,createdAt:new Date().toISOString().split("T")[0],updatedAt:new Date().toISOString().split("T")[0],deleted:false,ctc:+form.ctc||0};
      setCandidates(cs=>[...cs,newC]);
      setNextId(n=>n+1);
      log("Created",form.name,`Client: ${form.client}, Status: ${form.joiningStatus}`);
    } else {
      setCandidates(cs=>cs.map(c=>c.id===modal.data.id?{...c,...form,ctc:+form.ctc||0,updatedAt:new Date().toISOString().split("T")[0]}:c));
      log("Updated",form.name,`Status: ${form.joiningStatus}`);
    }
    setModal(null);
  };

  const navItems = [
    {key:"dashboard",label:"Dashboard",icon:"dashboard"},
    {key:"candidates",label:"Candidates",icon:"users"},
    {key:"reports",label:"Reports",icon:"chart"},
    ...(user.role==="admin"?[
      {key:"masters",label:"Master Data",icon:"settings"},
      {key:"audit",label:"Audit Log",icon:"eye"},
    ]:[]),
  ];

  const Sidebar = () => (
    <aside style={{width:220,background:"#0f172a",minHeight:"100vh",display:"flex",flexDirection:"column",flexShrink:0}}>
      <div style={{padding:"24px 20px 16px"}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:36,height:36,borderRadius:10,background:"linear-gradient(135deg,#2563eb,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          </div>
          <div>
            <div style={{fontSize:13,fontWeight:800,color:"white",lineHeight:1.1}}>Ample Leap</div>
            <div style={{fontSize:10,color:"#64748b",marginTop:1}}>CRM v2.0</div>
          </div>
        </div>
      </div>
      <nav style={{flex:1,padding:"8px 10px"}}>
        {navItems.map(n=>(
          <button key={n.key} onClick={()=>{setPage(n.key);setSidebarOpen(false);}} style={{width:"100%",display:"flex",alignItems:"center",gap:10,padding:"10px 12px",borderRadius:9,border:"none",background:page===n.key?"#1e40af22":"transparent",color:page===n.key?"#93c5fd":"#94a3b8",fontWeight:page===n.key?700:500,cursor:"pointer",fontSize:14,marginBottom:2,textAlign:"left",outline:"none"}}>
            <span style={{opacity:.8}}><Icon name={n.icon} size={16}/></span>{n.label}
          </button>
        ))}
      </nav>
      <div style={{padding:"16px 14px",borderTop:"1px solid #1e293b"}}>
        <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
          <div style={{width:32,height:32,borderRadius:8,background:"linear-gradient(135deg,#1e40af,#7c3aed)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:"white",flexShrink:0}}>
            {user.name[0]}
          </div>
          <div style={{overflow:"hidden"}}>
            <div style={{fontSize:12,fontWeight:700,color:"#e2e8f0",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name}</div>
            <div style={{fontSize:10,color:"#64748b",textTransform:"capitalize"}}>{user.role}</div>
          </div>
        </div>
        <button onClick={()=>setUser(null)} style={{width:"100%",display:"flex",alignItems:"center",gap:8,padding:"8px 10px",borderRadius:7,border:"none",background:"transparent",color:"#64748b",cursor:"pointer",fontSize:12,fontWeight:600}}>
          <Icon name="logout" size={13}/> Sign Out
        </button>
      </div>
    </aside>
  );

  return (
    <div style={{display:"flex",fontFamily:"'Inter',system-ui,sans-serif",minHeight:"100vh",background:"#f8fafc"}}>
      {/* Desktop sidebar */}
      <div style={{display:"block"}}><Sidebar/></div>

      {/* Main */}
      <main style={{flex:1,overflow:"auto",display:"flex",flexDirection:"column"}}>
        {/* Top bar */}
        <div style={{background:"white",borderBottom:"1px solid #f1f5f9",padding:"12px 24px",display:"flex",justifyContent:"space-between",alignItems:"center",position:"sticky",top:0,zIndex:10}}>
          <div style={{fontSize:13,color:"#64748b"}}>
            {new Date().toLocaleDateString("en-IN",{weekday:"long",day:"numeric",month:"long",year:"numeric"})}
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            <div style={{fontSize:13,background:"#f0f9ff",color:"#0369a1",border:"1px solid #bae6fd",padding:"4px 10px",borderRadius:20,fontWeight:600,textTransform:"capitalize"}}>
              {user.role}
            </div>
          </div>
        </div>

        <div style={{padding:24,flex:1}}>
          {page==="dashboard" && <Dashboard candidates={candidates} masters={masters}/>}
          {page==="candidates" && <CandidatesPage candidates={candidates} masters={masters} user={user} onAdd={handleAdd} onEdit={handleEdit} onDelete={handleDelete} onView={handleView}/>}
          {page==="reports" && <ReportsPage candidates={candidates}/>}
          {page==="masters" && user.role==="admin" && <MastersPage masters={masters} setMasters={setMasters}/>}
          {page==="audit" && user.role==="admin" && <AuditPage logs={auditLogs}/>}
        </div>
      </main>

      {/* Modals */}
      <Modal open={modal?.type==="add"} onClose={()=>setModal(null)} title="Add New Candidate" wide>
        <CandidateForm masters={masters} onSave={handleSave} onCancel={()=>setModal(null)}/>
      </Modal>
      <Modal open={modal?.type==="edit"} onClose={()=>setModal(null)} title="Edit Candidate" wide>
        <CandidateForm initial={modal?.data} masters={masters} onSave={handleSave} onCancel={()=>setModal(null)}/>
      </Modal>
      <Modal open={modal?.type==="view"} onClose={()=>setModal(null)} title="Candidate Profile">
        <ViewCandidate candidate={modal?.data}/>
      </Modal>
    </div>
  );
}
