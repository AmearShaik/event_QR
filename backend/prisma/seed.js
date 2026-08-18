const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

try {
  process.loadEnvFile('.env');
} catch (e) {}

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function normalizePaymentStatus(rawStatus) {
  if (!rawStatus || typeof rawStatus !== 'string') {
    return { normalizedStatus: 'NOT_PAID', correctedSpelling: false };
  }
  const trimmed = rawStatus.trim().toLowerCase().replace(/_/g, ' ');
  if (trimmed === 'paid') {
    return { normalizedStatus: 'PAID', correctedSpelling: false };
  }
  if (
    trimmed === 'partially paid' ||
    trimmed === 'partiallly paid' ||
    trimmed === 'partial paid' ||
    trimmed === 'partiallypaid'
  ) {
    const isTypo = trimmed === 'partiallly paid';
    return { normalizedStatus: 'PARTIALLY_PAID', correctedSpelling: isTypo };
  }
  if (trimmed === 'not paid' || trimmed === 'unpaid' || trimmed === 'notpaid') {
    return { normalizedStatus: 'NOT_PAID', correctedSpelling: false };
  }
  return { normalizedStatus: 'NOT_PAID', correctedSpelling: false };
}

function calculateEligibility(normalizedStatus) {
  return normalizedStatus === 'PAID';
}

const OFFICIAL_CANDIDATES = [
  {
    "studentId": "2451-22-732-001",
    "name": "MARYALA HARI VAMSHI KRISHNA",
    "program": "BE - CIV",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-732-002",
    "name": "GUNEMONI ADITHYA CHANDRA",
    "program": "BE - CIV",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-732-003",
    "name": "PUTTAGALLA SAI GANESH KUMAR",
    "program": "BE - CIV",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-732-005",
    "name": "SAMA KESHAV REDDY",
    "program": "BE - CIV",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-732-009",
    "name": "BANDI BHARATH KUMAR",
    "program": "BE - CIV",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-732-011",
    "name": "YADAGIRI VISHNU VARDHAN",
    "program": "BE - CIV",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-732-013",
    "name": "KANCHANAPALLY VAMSHI",
    "program": "BE - CIV",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-732-014",
    "name": "THALASANI MANIKANTA REDDY",
    "program": "BE - CIV",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-732-015",
    "name": "SHAIK NOUMAN",
    "program": "BE - CIV",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-732-017",
    "name": "M L VAISHNAVI MEHER",
    "program": "BE - CIV",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-732-018",
    "name": "LAVOORI HANUMANTHU",
    "program": "BE - CIV",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-732-019",
    "name": "VATYALA MURALI KRISHNA",
    "program": "BE - CIV",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-732-024",
    "name": "AZMEERA RAJU NAYAK",
    "program": "BE - CIV",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-732-026",
    "name": "DHARAVATH ROHITH",
    "program": "BE - CIV",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-732-027",
    "name": "M SREEMAN",
    "program": "BE - CIV",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-732-028",
    "name": "KONKATI UDAY",
    "program": "BE - CIV",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-732-029",
    "name": "KANCHAPOGU TARUN",
    "program": "BE - CIV",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-732-032",
    "name": "BADAVATH SAI VENU",
    "program": "BE - CIV",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-732-034",
    "name": "BUKYA DILEEP",
    "program": "BE - CIV",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-732-037",
    "name": "BHUKYA VAMSHI",
    "program": "BE - CIV",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-732-040",
    "name": "VISHWAS POTHUGANTI",
    "program": "BE - CIV",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-732-042",
    "name": "AASHRITH REDDY TEEGALA",
    "program": "BE - CIV",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-732-044",
    "name": "RASURI SAI KUMAR",
    "program": "BE - CIV",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-732-046",
    "name": "KATTA SAHASRA",
    "program": "BE - CIV",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-732-301",
    "name": "RAJARAPU MANOHAR",
    "program": "BE - CIV",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-732-302",
    "name": "ANANTHULA VIKAS",
    "program": "BE - CIV",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-732-303",
    "name": "AKULA DEEPAK",
    "program": "BE - CIV",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-732-304",
    "name": "SAILI SREEJA",
    "program": "BE - CIV",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-732-305",
    "name": "CHETHI SAIDEEP",
    "program": "BE - CIV",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-732-306",
    "name": "CHINTHAKINDI BHARGAVI",
    "program": "BE - CIV",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-732-307",
    "name": "CH PUJASRI",
    "program": "BE - CIV",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-732-308",
    "name": "A TRISHA",
    "program": "BE - CIV",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-732-309",
    "name": "PEBBETI SRINITHYA",
    "program": "BE - CIV",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-732-310",
    "name": "SAPAVAT KOUSHIK",
    "program": "BE - CIV",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-732-311",
    "name": "ANDE KRUPA SRAVANTHI",
    "program": "BE - CIV",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-732-312",
    "name": "SUREPALLY VIVEK VARDHAN",
    "program": "BE - CIV",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-732-313",
    "name": "T SHIVA KUMAR",
    "program": "BE - CIV",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-732-314",
    "name": "A ANUSHA",
    "program": "BE - CIV",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-732-315",
    "name": "BADRI SHUSHRUTHA",
    "program": "BE - CIV",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-732-317",
    "name": "M KRISHNA MOHAN REDDY",
    "program": "BE - CIV",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-732-318",
    "name": "PULIPATI PRAVEEN KUMAR",
    "program": "BE - CIV",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-733-002",
    "name": "KASIBHATTA LAKSHMI YASHASRI",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-003",
    "name": "DODDAPUNENI THARUN",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-004",
    "name": "RANGAVAJJULA KRISHNA ADVAITH SIDDHARTHA",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-005",
    "name": "JENIGE MYTHILI",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-008",
    "name": "ANAMONI RITHIKA",
    "program": "BE - CSE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-733-009",
    "name": "BOLISHETTY UDAY",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-010",
    "name": "V BHAVANI",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-011",
    "name": "BOLLOJU SAI VIKAS",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-012",
    "name": "SINTHOJU SAVYA",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-013",
    "name": "PANTHULA RUSHIKA",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-014",
    "name": "SAMANVITHA CHERUKU",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-015",
    "name": "SRIRAM SHRAVYA",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-017",
    "name": "KONDAPURAM AKHILA",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-018",
    "name": "CHOWKI SRIPARTHIVA",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-019",
    "name": "SANGANI CHANDANA",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-020",
    "name": "GADWAL HIMAY",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-021",
    "name": "BOMPALLI HARSHITA",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-022",
    "name": "METTARI YASHWANTH",
    "program": "BE - CSE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-733-023",
    "name": "BHUTHARAJU SRI SAI SHIVA",
    "program": "BE - CSE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-733-024",
    "name": "SATTU RAVI TEJA",
    "program": "BE - CSE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-733-025",
    "name": "KONDRU RAJA NAKSHATHRA",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-027",
    "name": "G SAI KARAN",
    "program": "BE - CSE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-733-028",
    "name": "NENAVATH TEJASWINI",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-030",
    "name": "KAMASANI KARTHIK",
    "program": "BE - CSE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-733-031",
    "name": "BATHINI SAI VIKRANTH REDDY",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-034",
    "name": "AKSHITHA JAMMA",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-035",
    "name": "PALAKODETI RITVIK",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-036",
    "name": "KOTI SRI LASYA",
    "program": "BE - CSE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-733-037",
    "name": "A RUCHI",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-038",
    "name": "SIRIN MADAGANI",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-040",
    "name": "SALIVENDRA HARSHITHA",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-041",
    "name": "ADITI JOSHI",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-044",
    "name": "ALLADI VISHNU SAI",
    "program": "BE - CSE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-733-045",
    "name": "ARABATI PRANAV KOUNDINYA",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-047",
    "name": "PURELLY SHARANYAA",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-049",
    "name": "SAMUDRALA SAHARSHA",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-050",
    "name": "KATIKAREDDY CHARMITHA REDDY",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-051",
    "name": "YERRAMSETTY SIDDARTH",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-053",
    "name": "V HARSHITHA",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-054",
    "name": "VANAMPALLY OM PRAKASH REDDY",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-055",
    "name": "VADREVU SHIVANAGA VENKATA SAI HARI SUBHASH",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-056",
    "name": "CHANDRA YASHWANTH",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-057",
    "name": "REDDYGARI YASHWANTH REDDY",
    "program": "BE - CSE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-733-059",
    "name": "GADDE KALYAN",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-060",
    "name": "BANDARI SAITEJA",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-061",
    "name": "SAIREDDY MANASVI",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-062",
    "name": "KOMATLA SAI AKSHITH REDDY",
    "program": "BE - CSE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-733-063",
    "name": "ADAVI SURYA LALITH SHOURIE",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-064",
    "name": "HUSNABAD VARSHINI",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-065",
    "name": "GINUKALA GEETHA",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-066",
    "name": "ABDUL MUIZZ",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-067",
    "name": "KALLURI VARSHITHA",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-068",
    "name": "MARAGOUNI SANVIKA",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-069",
    "name": "ALENOOR SUSHRUTHA",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-070",
    "name": "BADAKA NAVEEN",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-071",
    "name": "KUNDURU SHASHANK YADAV",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-073",
    "name": "OM PRAKASH KUMAR",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-074",
    "name": "SAMALA SRISHANTH",
    "program": "BE - CSE",
    "paymentStatus": "Partiallly Paid"
  },
  {
    "studentId": "2451-22-733-075",
    "name": "GODESHI RISHITHA",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-076",
    "name": "JAMPALA SWATHVIK",
    "program": "BE - CSE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-733-077",
    "name": "SUDHINI MITISH REDDY",
    "program": "BE - CSE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-733-078",
    "name": "MOHAMMAD ABDUL WAHEED",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-079",
    "name": "KURMAPU JAHNAVI",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-080",
    "name": "KAMBALAPALLY ABHINAV REDDY",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-081",
    "name": "LAKSHMIPURAM NITYA SRI",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-082",
    "name": "REVALLY SRAVANI",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-083",
    "name": "THUDUM PRADEEP",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-084",
    "name": "GANTLA NAVANEETH REDDY",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-085",
    "name": "MALKAGALLA KARUNAKAR",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-086",
    "name": "PILLI DEEKSHITHA",
    "program": "BE - CSE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-733-087",
    "name": "VOGGU VIDYA RANI",
    "program": "BE - CSE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-733-088",
    "name": "BHUKALA AKSHITHA YADAV",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-089",
    "name": "GUJJA SAI SRUTHI",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-090",
    "name": "NIMMALA RISHI KUMAR REDDY",
    "program": "BE - CSE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-733-091",
    "name": "KANDARAM DEEPTHI",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-093",
    "name": "SAMEER SHUKLA",
    "program": "BE - CSE",
    "paymentStatus": "Partiallly Paid"
  },
  {
    "studentId": "2451-22-733-094",
    "name": "BODDUPALLY MANOJ",
    "program": "BE - CSE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-733-096",
    "name": "MUDDAM KARTHIK REDDY",
    "program": "BE - CSE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-733-097",
    "name": "MADHAVARAM ARJUNCHANDRA",
    "program": "BE - CSE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-733-098",
    "name": "VELIMENETI PREETHI REDDY",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-099",
    "name": "GADDAM SATHWIK REDDY",
    "program": "BE - CSE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-733-101",
    "name": "ERRABELLI SATHVIK",
    "program": "BE - CSE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-733-102",
    "name": "KUNA RASHMITHA",
    "program": "BE - CSE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-733-103",
    "name": "JEVALA SREEJA",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-104",
    "name": "INAGANTI LASYA",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-105",
    "name": "POLSANI SAI RAM RAO",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-106",
    "name": "BANDI AKHILA",
    "program": "BE - CSE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-733-107",
    "name": "ALUWALA AKSHITHA",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-108",
    "name": "KOLACHALA SAI ROHIT",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-109",
    "name": "JORRIGALA JYOTHIRMAI",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-110",
    "name": "KALWA SNEHA",
    "program": "BE - CSE",
    "paymentStatus": "Partiallly Paid"
  },
  {
    "studentId": "2451-22-733-111",
    "name": "AMMATI JAHNAVI",
    "program": "BE - CSE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-733-112",
    "name": "SAMULA VENKATESHWAR REDDY",
    "program": "BE - CSE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-733-113",
    "name": "SATHA BHUVANA CHANDRIKA",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-114",
    "name": "NAVERSE AKSHITHA",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-115",
    "name": "THALARI SHIVA",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-116",
    "name": "CHERVIRALA SAIKEERTHANA",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-117",
    "name": "SNEHA DWIVEDI",
    "program": "BE - CSE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-733-118",
    "name": "DYAPA HARINI",
    "program": "BE - CSE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-733-119",
    "name": "GAYALOLU CHARAN",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-120",
    "name": "NORI SAI AKHILESH",
    "program": "BE - CSE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-733-121",
    "name": "TADURI HARSHAVARDHAN",
    "program": "BE - CSE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-733-122",
    "name": "VENNAMPALLI SRIRAM",
    "program": "BE - CSE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-733-123",
    "name": "MYADARABOINA ABHISHEK",
    "program": "BE - CSE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-733-124",
    "name": "ALLABOINA SATHYA PRANAV",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-125",
    "name": "KEETHA NIKHIL",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-126",
    "name": "MIRIYALA RAJASREE",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-127",
    "name": "MAMIDI VAIBHAV SAI MANISH",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-129",
    "name": "BABU APUROOP GOUD",
    "program": "BE - CSE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-733-130",
    "name": "KASULA PHANI KUMAR",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-132",
    "name": "VEMULA MEDHA",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-133",
    "name": "SHAIK ABUBAKR",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-134",
    "name": "REVELLI VENKATESH",
    "program": "BE - CSE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-733-135",
    "name": "MERDHA VIPIN RAJ",
    "program": "BE - CSE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-733-137",
    "name": "KOMMOLLU SULOCHANA PREETHI",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-138",
    "name": "KARANTOTHU PRIYADARSHINI",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-139",
    "name": "PRATEEK BOINPALLY",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-141",
    "name": "KURCHETI PARTHIV SAI",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-142",
    "name": "KARAMPURI ANUSHA",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-143",
    "name": "GUNDI HARSHA",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-144",
    "name": "BURUGU KRUPA HELEN",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-145",
    "name": "VAISHNAVI JAMALPUR",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-146",
    "name": "SANA",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-147",
    "name": "RAVULA VISHWAK TEJA",
    "program": "BE - CSE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-733-148",
    "name": "JAYANTH RAHUL YELISETTI",
    "program": "BE - CSE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-733-149",
    "name": "RACHAKONDA SIRI",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-150",
    "name": "BUKKA KARTHIKEYAN",
    "program": "BE - CSE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-733-151",
    "name": "MANTHENA SRI KRISHNA KOUSHIK",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-152",
    "name": "KAMSALA SURYA PRABHAS",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-153",
    "name": "P ASRITH RAJ REDDY",
    "program": "BE - CSE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-733-154",
    "name": "MANCHANI VISHNU VARDHAN REDDY",
    "program": "BE - CSE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-733-158",
    "name": "MAHANKALI BHAVANA",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-159",
    "name": "VUCHA AVIS LAKSHMI DEEPIKA",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-160",
    "name": "YEDAVALLI PARDHIV REDDY",
    "program": "BE - CSE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-733-161",
    "name": "SHASHIKANTH REDDY NALLA",
    "program": "BE - CSE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-733-163",
    "name": "VALLAB REDDY SAI PRAKASH REDDY",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-164",
    "name": "KUCHIPUDI SAI CHARAN ADITHYA",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-165",
    "name": "RAAVI SESHA SAI",
    "program": "BE - CSE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-733-166",
    "name": "PAKALA SAI TEEPU NIHARIKA",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-167",
    "name": "PARCHA VENKATA ROHAN",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-168",
    "name": "A ROHITH",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-169",
    "name": "ABHINAV ANIL MANGALA",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-170",
    "name": "DEVARAJU BADRI KRISHNA YASHASVI",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-172",
    "name": "KANUGU RAJESH",
    "program": "BE - CSE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-733-173",
    "name": "SANJEEVA NAVYA",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-174",
    "name": "MALLEKEDI PRUDHVI",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-175",
    "name": "BAJANTRI AKSHAY",
    "program": "BE - CSE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-733-177",
    "name": "M ABISHEK",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-181",
    "name": "SHANAGONDA SAI SUPRITH",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-182",
    "name": "EMBADI PREETHAM REDDY",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-186",
    "name": "PALUGULLA NAINA",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-187",
    "name": "KARRI HARSHA VARDHAN",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-301",
    "name": "AMPALLA SRAVANTHI",
    "program": "BE - CSE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-733-302",
    "name": "SIGURU JAHNAVI",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-303",
    "name": "ADEPU ANKITHA",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-304",
    "name": "GUDIPATI SREEKAR",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-305",
    "name": "KASANABOINA MYTHRI",
    "program": "BE - CSE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-733-306",
    "name": "GADE KRISHNA MANOHAR",
    "program": "BE - CSE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-733-307",
    "name": "BANOTH MAHENDAR",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-308",
    "name": "GADDAM SHARAN",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-309",
    "name": "JAPALA BHANU",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-310",
    "name": "S LAHARI",
    "program": "BE - CSE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-733-311",
    "name": "BEERAM VASANTH KUMAR REDDY",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-312",
    "name": "AGAPU SIDDHU",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-313",
    "name": "ANDROJU LAXMI PRASANNA",
    "program": "BE - CSE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-733-316",
    "name": "MOHD ZUNAID KHAN",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-317",
    "name": "PALABINDALA CHARANYA",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-318",
    "name": "BAYYA BHASKAR",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-319",
    "name": "MANDLA ASHVITHA",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-320",
    "name": "MOHD ASRAR UDDIN",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-733-321",
    "name": "ARUPULA KEERTHI",
    "program": "BE - CSE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-733-322",
    "name": "VALLAMDAS PRAVALIKA",
    "program": "BE - CSE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-748-001",
    "name": "KOTHAPALLI SAI SRIVATSAV",
    "program": "BE - CSM",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-748-002",
    "name": "NAINAKANTI SRUJAN",
    "program": "BE - CSM",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-748-003",
    "name": "KANDIMALLA VENKATA GAYATHRI ANUGHNA",
    "program": "BE - CSM",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-748-004",
    "name": "RACHAMADUGU YASHWANTH KUMAR",
    "program": "BE - CSM",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-748-005",
    "name": "PULLURI SATWIKA",
    "program": "BE - CSM",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-748-006",
    "name": "RAMIDI NEETISH REDDY",
    "program": "BE - CSM",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-748-007",
    "name": "KOTA GAYATHRI",
    "program": "BE - CSM",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-748-008",
    "name": "TUMMURU AKSHAYA BHARATHI",
    "program": "BE - CSM",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-748-009",
    "name": "BOLLA SATHVIKA",
    "program": "BE - CSM",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-748-010",
    "name": "PAPISHETTY VARSHITHA",
    "program": "BE - CSM",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-748-011",
    "name": "GADDAM RUTHVIKA",
    "program": "BE - CSM",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-748-012",
    "name": "BIRELLI TANVI",
    "program": "BE - CSM",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-748-014",
    "name": "PUTTAM ABHINAV",
    "program": "BE - CSM",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-748-015",
    "name": "ALIGETI SRI CHARITHA",
    "program": "BE - CSM",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-748-016",
    "name": "AVULA SANJAY KUMAR",
    "program": "BE - CSM",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-748-017",
    "name": "KANAPARTHY REVANTH SIDDARTHA",
    "program": "BE - CSM",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-748-018",
    "name": "NANDAGIRI AKHILA",
    "program": "BE - CSM",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-748-019",
    "name": "MACHARLA ASMITHA",
    "program": "BE - CSM",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-748-020",
    "name": "MOHAMMAD SHOAIB ALAM",
    "program": "BE - CSM",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-748-021",
    "name": "VAVILLA ARJUN",
    "program": "BE - CSM",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-748-022",
    "name": "KROSURI SHASHANK",
    "program": "BE - CSM",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-748-023",
    "name": "VUYYALA SHIVANI",
    "program": "BE - CSM",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-748-024",
    "name": "KOKKERAGADDA SAHITH",
    "program": "BE - CSM",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-748-025",
    "name": "JUTUKA TEJAS",
    "program": "BE - CSM",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-748-026",
    "name": "CHITYALA SIRISHA",
    "program": "BE - CSM",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-748-028",
    "name": "B NAVEEN",
    "program": "BE - CSM",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-748-030",
    "name": "KUMMATADA SANDEEP KUMAR",
    "program": "BE - CSM",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-748-031",
    "name": "KORMENI VAISHNAVI",
    "program": "BE - CSM",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-748-033",
    "name": "KETHAVATH DEEPIKA",
    "program": "BE - CSM",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-748-034",
    "name": "KASIREDDY SHIRISHA",
    "program": "BE - CSM",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-748-035",
    "name": "RAMAKA ANANDA KISHORE SHASTRY",
    "program": "BE - CSM",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-748-036",
    "name": "KALAKONDA MANAS REDDY",
    "program": "BE - CSM",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-748-038",
    "name": "KUMBHAM ADEEP REDDY",
    "program": "BE - CSM",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-748-039",
    "name": "MANYAM VENKATA AVINASH",
    "program": "BE - CSM",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-748-040",
    "name": "MADDI SAI CHARAN REDDY",
    "program": "BE - CSM",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-748-041",
    "name": "MANDA ANIRUDH REDDY",
    "program": "BE - CSM",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-748-042",
    "name": "DHRUVI PATEL",
    "program": "BE - CSM",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-748-043",
    "name": "BILLA TASWI",
    "program": "BE - CSM",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-748-044",
    "name": "NICHALA SUJAY",
    "program": "BE - CSM",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-748-047",
    "name": "EITHEM SHASHANK",
    "program": "BE - CSM",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-748-048",
    "name": "GUMMADI SOWMYA",
    "program": "BE - CSM",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-748-049",
    "name": "GUMMADI SNEHA",
    "program": "BE - CSM",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-748-050",
    "name": "SOMINENI MEGHANA",
    "program": "BE - CSM",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-748-051",
    "name": "RACHAMALLA MANVITHA",
    "program": "BE - CSM",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-748-052",
    "name": "JONNADA AKSHITHA",
    "program": "BE - CSM",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-748-053",
    "name": "PRAKYA SRIVANI",
    "program": "BE - CSM",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-748-054",
    "name": "THIRUNAGARU SANTHOSH",
    "program": "BE - CSM",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-748-055",
    "name": "MARKAPURAM VENKATA AKHIL",
    "program": "BE - CSM",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-748-056",
    "name": "BOJJA AISHWARYA",
    "program": "BE - CSM",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-748-057",
    "name": "SAMULA SHASHIDHAR REDDY",
    "program": "BE - CSM",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-748-058",
    "name": "DHRUV REDDY GADDAMEEDI",
    "program": "BE - CSM",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-748-061",
    "name": "NELANTI NIKHIL",
    "program": "BE - CSM",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-748-062",
    "name": "GOVINDWAR NAGA LASYA",
    "program": "BE - CSM",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-748-063",
    "name": "CHALMANI DEVANSH KARTHIK",
    "program": "BE - CSM",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-748-064",
    "name": "JALAGARI BHARGAV",
    "program": "BE - CSM",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-748-065",
    "name": "BONAGIRI RITHEESH",
    "program": "BE - CSM",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-748-301",
    "name": "TIRMANDAS HARSHITHA",
    "program": "BE - CSM",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-748-302",
    "name": "SHAIK MOHAMMAD AQUHIL",
    "program": "BE - CSM",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-748-303",
    "name": "MOHAMMAD RAHIMATHULLA",
    "program": "BE - CSM",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-748-305",
    "name": "GANUPAKA GRACE",
    "program": "BE - CSM",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-748-306",
    "name": "GAJAPAKA SATVIK",
    "program": "BE - CSM",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-750-001",
    "name": "NARAYAN CHAITAN REDDY",
    "program": "BE - CSD",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-750-002",
    "name": "THALLADA PRANEETH KUMAR",
    "program": "BE - CSD",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-750-003",
    "name": "BOLLAVARAM AKSHITHA",
    "program": "BE - CSD",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-750-004",
    "name": "GADVAL NARENDHAR",
    "program": "BE - CSD",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-750-005",
    "name": "KALLEPU SAI LOKESH",
    "program": "BE - CSD",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-750-006",
    "name": "KANDAGATLA UDAYKIRAN",
    "program": "BE - CSD",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-750-007",
    "name": "CHITTUMURU SRI NITHYA",
    "program": "BE - CSD",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-750-008",
    "name": "ONTEDDU POOJA",
    "program": "BE - CSD",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-750-009",
    "name": "JAMMALAMADAKA SHIVA SHREYA",
    "program": "BE - CSD",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-750-010",
    "name": "GANGIDI VINEESHA",
    "program": "BE - CSD",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-750-011",
    "name": "MALLAREDDY PRANAVI",
    "program": "BE - CSD",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-750-012",
    "name": "RISHIKA REDDY VARALA",
    "program": "BE - CSD",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-750-014",
    "name": "RAPOLU SRIVARDHINI",
    "program": "BE - CSD",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-750-015",
    "name": "DUDYALA SATHVIK",
    "program": "BE - CSD",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-750-016",
    "name": "ADEPU SHARATH",
    "program": "BE - CSD",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-750-017",
    "name": "MUNIGALA GANESH PATEL",
    "program": "BE - CSD",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-750-018",
    "name": "TUMMALACHERLA SAKETHA RAMA",
    "program": "BE - CSD",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-750-019",
    "name": "GURRAM VISHWAVARDHAN",
    "program": "BE - CSD",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-750-020",
    "name": "ANUGANTI AKSHITH",
    "program": "BE - CSD",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-750-021",
    "name": "JONNAGADDA SAGARIKA",
    "program": "BE - CSD",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-750-022",
    "name": "SHAIK MOHAMMAD JUNAID",
    "program": "BE - CSD",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-750-023",
    "name": "POLOJU SHIVA",
    "program": "BE - CSD",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-750-024",
    "name": "MOVVA STEPHEN TIMOTHY",
    "program": "BE - CSD",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-750-026",
    "name": "JANGILI SRI VAISHNAVI",
    "program": "BE - CSD",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-750-027",
    "name": "ATTAM SWAMY SHREYA KEERTHANA",
    "program": "BE - CSD",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-750-028",
    "name": "BOYAPALLI KUSHWANTH REDDY",
    "program": "BE - CSD",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-750-029",
    "name": "EDARA USHA",
    "program": "BE - CSD",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-750-030",
    "name": "YACHARAM DEEKSHITHA SHARVANI",
    "program": "BE - CSD",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-750-031",
    "name": "BOPPI MAHIMA",
    "program": "BE - CSD",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-750-033",
    "name": "VEMULA SRIMAAN SHREYAS",
    "program": "BE - CSD",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-750-035",
    "name": "MULAMPALLI SHIVANI",
    "program": "BE - CSD",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-750-036",
    "name": "ANDRA VIDISHA",
    "program": "BE - CSD",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-750-037",
    "name": "YANALA RISHITHA REDDY",
    "program": "BE - CSD",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-750-038",
    "name": "BATTHULA GOUTHAM SRIHARI ROHITH",
    "program": "BE - CSD",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-750-040",
    "name": "KUNTLA NISHITHA",
    "program": "BE - CSD",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-750-041",
    "name": "DANDI SAATHIVIK",
    "program": "BE - CSD",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-750-042",
    "name": "PRANAV SANA",
    "program": "BE - CSD",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-750-043",
    "name": "KONDURU ALEKYA",
    "program": "BE - CSD",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-750-044",
    "name": "NETTU PEHLAJ",
    "program": "BE - CSD",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-750-045",
    "name": "DINESH YADAV ALLE",
    "program": "BE - CSD",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-750-048",
    "name": "KANCHETI NEHA",
    "program": "BE - CSD",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-750-049",
    "name": "B SAI DHANUSH",
    "program": "BE - CSD",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-750-050",
    "name": "MULLAPUDI SAI NIRUPAM",
    "program": "BE - CSD",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-750-051",
    "name": "ELURI SHARANYA",
    "program": "BE - CSD",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-750-052",
    "name": "ALE PARTHIV",
    "program": "BE - CSD",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-750-053",
    "name": "NIZAMPATNAM VAISHNAVI",
    "program": "BE - CSD",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-750-054",
    "name": "GUNJI VASU",
    "program": "BE - CSD",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-750-055",
    "name": "SUNKANNA MEGHANA",
    "program": "BE - CSD",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-750-056",
    "name": "SUNKANNA KEERTHI",
    "program": "BE - CSD",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-750-057",
    "name": "LOKA SOUMITH REDDY",
    "program": "BE - CSD",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-750-058",
    "name": "AARON JOSHUA",
    "program": "BE - CSD",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-750-059",
    "name": "KASTHALA KASHYAP",
    "program": "BE - CSD",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-750-060",
    "name": "POTTI DASHWANTH RAJ",
    "program": "BE - CSD",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-750-061",
    "name": "KAMBHAMPATI SAI GURU CHARAN",
    "program": "BE - CSD",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-750-062",
    "name": "TELUGU VIGNESH",
    "program": "BE - CSD",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-750-063",
    "name": "KUSURU VENKAT ABHINAV",
    "program": "BE - CSD",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-750-064",
    "name": "GATHADI SHIVARAJ",
    "program": "BE - CSD",
    "paymentStatus": "Partiallly Paid"
  },
  {
    "studentId": "2451-22-750-301",
    "name": "VARIKUPPALA NANDINI",
    "program": "BE - CSD",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-750-302",
    "name": "G DHEERAJSRI GOUD",
    "program": "BE - CSD",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-750-303",
    "name": "AJMIRA BHAVANI PRASAD NAYAK",
    "program": "BE - CSD",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-750-304",
    "name": "TALLA TRIPURA",
    "program": "BE - CSD",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-750-305",
    "name": "NALLAGATLA RAJESH",
    "program": "BE - CSD",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-750-306",
    "name": "JENIGALA SHARATH CHANDRA",
    "program": "BE - CSD",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-750-307",
    "name": "AKHILESH SARMA ILAPAVULURI",
    "program": "BE - CSD",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-749-001",
    "name": "JANGALA NAGARAJU",
    "program": "BE - CIC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-749-003",
    "name": "AREKELA NAVYA BHARATHI",
    "program": "BE - CIC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-749-004",
    "name": "ANANTHULA UJWAL",
    "program": "BE - CIC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-749-005",
    "name": "CHERUKURI MANOHAR",
    "program": "BE - CIC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-749-006",
    "name": "BOLENANE KUSUMA",
    "program": "BE - CIC",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-749-007",
    "name": "SYED MUZZAMMIL AHMED",
    "program": "BE - CIC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-749-008",
    "name": "SAI SHRUTI VADLAMANI",
    "program": "BE - CIC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-749-009",
    "name": "KUCHIBHOTLA DURGA SREEYA",
    "program": "BE - CIC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-749-010",
    "name": "MODUGU SREEJA",
    "program": "BE - CIC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-749-011",
    "name": "BADUGULA SUJITH REDDY",
    "program": "BE - CIC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-749-012",
    "name": "TELUKUNTLA VIVEK CHANDRA",
    "program": "BE - CIC",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-749-014",
    "name": "MURALA KESHAVARDHAN",
    "program": "BE - CIC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-749-016",
    "name": "MASNA VIGNESH",
    "program": "BE - CIC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-749-018",
    "name": "V HARSHITA",
    "program": "BE - CIC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-749-019",
    "name": "KONDAMADUGU AKSHITH SAI",
    "program": "BE - CIC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-749-020",
    "name": "A SRI RASHMI",
    "program": "BE - CIC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-749-021",
    "name": "GOTTE THIRU HABINASH YADAV",
    "program": "BE - CIC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-749-022",
    "name": "SOMISHETTI TEJASRI",
    "program": "BE - CIC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-749-023",
    "name": "CHITYALA SARAYU",
    "program": "BE - CIC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-749-024",
    "name": "GANTA SAI SRITHA",
    "program": "BE - CIC",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-749-025",
    "name": "GILLELLA RAHUL",
    "program": "BE - CIC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-749-026",
    "name": "PADAM SUSHEEL KUMAR",
    "program": "BE - CIC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-749-027",
    "name": "DEPAVATH PAVAN KALYAN",
    "program": "BE - CIC",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-749-028",
    "name": "SHAIK MAHIYA MUSKAAN",
    "program": "BE - CIC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-749-029",
    "name": "CHUTTUGULLA SUJITH KUMAR",
    "program": "BE - CIC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-749-030",
    "name": "RAJAMURI HARSHITHA",
    "program": "BE - CIC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-749-033",
    "name": "MOHAMMED ASRAR AHMED",
    "program": "BE - CIC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-749-034",
    "name": "UNNATI JADHAV",
    "program": "BE - CIC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-749-036",
    "name": "SANKA SHRESHTA",
    "program": "BE - CIC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-749-037",
    "name": "JOSHI VAMSHI KRISHNA",
    "program": "BE - CIC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-749-038",
    "name": "VUYYALA GANESH GOUD",
    "program": "BE - CIC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-749-039",
    "name": "CHALLA NAGA NISHITH",
    "program": "BE - CIC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-749-040",
    "name": "PONNAM VEDHA SRI",
    "program": "BE - CIC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-749-041",
    "name": "BOMIDIKA ANANYA REDDY",
    "program": "BE - CIC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-749-042",
    "name": "PEDDOLLA SURYA TEJA REDDY",
    "program": "BE - CIC",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-749-043",
    "name": "SYED NILOFER",
    "program": "BE - CIC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-749-044",
    "name": "RACHAMALLA SATHWIKA",
    "program": "BE - CIC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-749-046",
    "name": "BANGARU SAI CHARAN",
    "program": "BE - CIC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-749-047",
    "name": "MENDU SUJAY REDDY",
    "program": "BE - CIC",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-749-048",
    "name": "MOHAMMED ABDUL KHADER",
    "program": "BE - CIC",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-749-049",
    "name": "TANISHIKA KIRAN UBALE",
    "program": "BE - CIC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-749-050",
    "name": "VYDYULA SHANMUKHA DATTA",
    "program": "BE - CIC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-749-051",
    "name": "PAVULA MANAS",
    "program": "BE - CIC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-749-052",
    "name": "MUTLURU NAMRATHA SHIVANI",
    "program": "BE - CIC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-749-053",
    "name": "AITHA LIKHITHA",
    "program": "BE - CIC",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-749-054",
    "name": "PURANAM NAGA PHANEENDRA",
    "program": "BE - CIC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-749-055",
    "name": "BHOOMIKA RAMCHANDANI",
    "program": "BE - CIC",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-749-058",
    "name": "PRIYANSHU KAKULARAM",
    "program": "BE - CIC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-749-060",
    "name": "MADIPALLY RAM CHARAN",
    "program": "BE - CIC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-749-061",
    "name": "GADE NIKITHA",
    "program": "BE - CIC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-749-063",
    "name": "TIRUMALA MANI KUMAR",
    "program": "BE - CIC",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-749-301",
    "name": "THAKALLAPELLY SRAVANTHI",
    "program": "BE - CIC",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-749-303",
    "name": "VEENAVANKA ADI VISHNU",
    "program": "BE - CIC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-749-305",
    "name": "TUMMALA MANIKANTA",
    "program": "BE - CIC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-749-308",
    "name": "VUPPALA SAKETH KUMAR",
    "program": "BE - CIC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-002",
    "name": "BEESAM MEGHANA REDDY",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-003",
    "name": "DENDI PRIYANKA REDDY",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-004",
    "name": "LANKA VENKATA SIVA NAGASRUTHI",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-005",
    "name": "MADABUSHI SREE HARSHITH PHANI",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-006",
    "name": "REPAKA SHIVA KRISHNA",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-007",
    "name": "J VIDHYA REDDY",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-008",
    "name": "VELDANDA GOWTHAM",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-009",
    "name": "VADDI NITHISH REDDY",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-010",
    "name": "GORRE SAI PHANI",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-011",
    "name": "MANTHAPURAM KRISHNA CHAITANYA",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-012",
    "name": "MAMIDALA HARSHA VARDHAN",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-013",
    "name": "AKULA SAI VIVEK",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-015",
    "name": "KUNDURU GAYATHRI",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-016",
    "name": "PUTTA TEJA",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-017",
    "name": "MACHA NAVEENA",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-019",
    "name": "ANAKAPALLY SATHWIK ROSHAN",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-020",
    "name": "KANCHETTI AKSHAYA",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-022",
    "name": "DESHAGOUNI SAI TEJA",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-024",
    "name": "MASAGOUNI AKSHITHA",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-026",
    "name": "BHOGARAJU SAI RAM",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-027",
    "name": "SIDDAM NAGA SIDDHARTH",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-028",
    "name": "VENUVANKA MANASA",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-029",
    "name": "CHELIMILLA PRIYANKA",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-030",
    "name": "KESHI REDDY ALEKHYA",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-031",
    "name": "PERUBOINA SATYA SAI SHASHANK",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-036",
    "name": "PRATHI MANAS VISWANAUTH",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-038",
    "name": "MOHAMMAD ADEEBA FATHIMA",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-039",
    "name": "K HARSHA VARDHAN RAO",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-040",
    "name": "RODDA VINEELA SEIN",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-041",
    "name": "BHUKYA SHILPA",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-042",
    "name": "GAJULA NARMADA",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-043",
    "name": "ATHMAKURI SAI RAM",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-045",
    "name": "NAGARAPU LAKSHMI SANJEEVINI",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-046",
    "name": "TUMULA NAMITHA",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-048",
    "name": "ATHOTA YAMINI",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-049",
    "name": "KATTELA SATHVIK CHANDRA",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-050",
    "name": "RUPANAKUNTLA KOUSHIK BHAGEERATH",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-053",
    "name": "AKSHIT DARLA",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-054",
    "name": "MOHAMMED MUQUEED UDDIN",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-056",
    "name": "GIRI VIKAS",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-057",
    "name": "KOTHALANKA MEENAKSHI",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-059",
    "name": "DAKKANNAGARI LAKSHITH REDDY",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-060",
    "name": "MAKAM VYSHNAVI",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-063",
    "name": "PACHIPALA BHARATH",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-065",
    "name": "VEERAMALLA ESHWAR",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-066",
    "name": "SUSARLA KEERTHI",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-067",
    "name": "DEREDDY KOUSHIK REDDY",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-068",
    "name": "KOMMIDI MANISH REDDY",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-069",
    "name": "SAKSHAM THAKUR",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-070",
    "name": "YEDIRE SAHITHI",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-071",
    "name": "NAKKA MALLIKARJUN",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-072",
    "name": "GUNDEMONI SAI KIRAN KUMAR GOUD",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-073",
    "name": "VENEPALLI SANJANA",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-074",
    "name": "MADDIKUNTLA JAGADISHWAR",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-075",
    "name": "THALLAPALY SHRAVYA",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-076",
    "name": "JANGILI MANOJ KUMAR",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-077",
    "name": "THAMBALA PRANEETH KUMAR",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-078",
    "name": "PATHIPAKA KARTHIK",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-079",
    "name": "KASPA NIVAS CHARY",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-080",
    "name": "ANISHA DEV PETIKAM",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-081",
    "name": "PANUGANTI BHAVANA",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-083",
    "name": "PEDDABOMMA PAVAN KUMAR",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-085",
    "name": "MUNAGAPATI SANGEETHA",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-086",
    "name": "GURRAPU PRUTHVIK SAI",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-087",
    "name": "BODDU SINDHU",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-088",
    "name": "BINGI MANISAI",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-089",
    "name": "KOYYADA ABHINAY KUMAR GOUD",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-090",
    "name": "ADIRE SRILATHA",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-091",
    "name": "KONGA NIVEDITHA",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-092",
    "name": "MANGA VISHNU",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-093",
    "name": "GANAPAVARAPU HEMA NAGA VAISHNAVI",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-094",
    "name": "JARPULA SUMAN",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-099",
    "name": "VENKAT RITVIK",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-100",
    "name": "CHINTADA JAIDEEP BHARADWAJ",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-102",
    "name": "CHINNAPAGA BHANUSRI",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-103",
    "name": "LELLELA MOUNIKA",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-104",
    "name": "MAMIDANNA NAGA SAI AKHIL",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-105",
    "name": "GAINI SRIDHAR",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-106",
    "name": "VEESAMSETTY PRAKYA",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-109",
    "name": "LATTUPALLY VARSHITHA",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-111",
    "name": "THADURI MADHU VANITHA",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-112",
    "name": "RANGA ROHINI",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-114",
    "name": "SHAIK AALIYA UZMA",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-115",
    "name": "CHINTHAKUNTLA RAMYA",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-117",
    "name": "ADITI HOTKAR",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-119",
    "name": "TODISHETTY ESTHER RANI",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-120",
    "name": "ANUMANDLA NAGIREDDY",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-121",
    "name": "DASA SAI VENKATA RAKESH",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-122",
    "name": "BOBBILI ASINI REDDY",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-124",
    "name": "KALAL PAVAN KALYAN",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-125",
    "name": "TIRIVIDHI JEDIDYA",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-126",
    "name": "CHENGOLI VEDAMAYI",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-127",
    "name": "VENKATAPURAM PRAGNAN REDDY",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-128",
    "name": "MACHIPEDDI PUJASHREE",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-129",
    "name": "GONDALE SRINIVAS",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-130",
    "name": "SAI SHANTHAN THADURI",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-132",
    "name": "DENDI SATHVIK REDDY",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-133",
    "name": "KOILAKONDA SHIVA KARTHIK",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-134",
    "name": "THUMU SIRI CHANDANA",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-135",
    "name": "MANDADI NIHARIKA",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-136",
    "name": "ALUGONDA HARSHITHA REDDY",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-137",
    "name": "BOLLAPALLY KAVYA",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-138",
    "name": "NUNE KAVYA",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-139",
    "name": "VURE PRAGNYA",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-140",
    "name": "THATIPAMULA MISHAL",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-141",
    "name": "VARAGANTI MANOGNAN",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-142",
    "name": "AGALA GOPINADH",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-144",
    "name": "MOHAMMED SHAMSHUDDIN",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-145",
    "name": "BODRAMONI ESHIKA",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-146",
    "name": "DOREPALLY ADITHYA VARDHAN",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-147",
    "name": "ANALDAS YASHRAJ",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-149",
    "name": "REHAN SHAIK",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-150",
    "name": "MOHAMMED AZEEM ALI",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-151",
    "name": "K MANOJ KUMAR",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-153",
    "name": "ATLA SAMPREETHI",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-156",
    "name": "PALLE NANDHINI",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-157",
    "name": "G JAGADEESHWARI NAGA VENKATA LAKSHMI",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-158",
    "name": "BITLA SRUTHI",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-159",
    "name": "AEDULA ANU",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-160",
    "name": "KONGARA POOJA",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-166",
    "name": "BATHULA ARUN KUMAR",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-167",
    "name": "BANDARU SURYA KALYAN",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-168",
    "name": "CHILUMULA ABHINAYA",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-169",
    "name": "RAJAM KAVISH",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-173",
    "name": "KAVALI SHIVANI",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-174",
    "name": "MADDI PRAVEEN KUMAR",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-175",
    "name": "PANDI VIJAYENDRA BABU",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-177",
    "name": "CHIMMANA ANANYA",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-179",
    "name": "DHARMAJI VISHNU VARDHAN",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-180",
    "name": "MUPPANENI TULASI VENKATA KRISHNA BABU",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-184",
    "name": "S ARAVINDA SAI",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-185",
    "name": "JALLA BHANUTEJA MANIKANTA",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-187",
    "name": "VEMPARALA ABHINAV TEJA",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-188",
    "name": "MOTHAKANI RAJESH",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-189",
    "name": "NOMULA KARTHIK",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-301",
    "name": "TULA RAJDEEKSHITH",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-302",
    "name": "PALSAM VINAY GOUD",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-303",
    "name": "LAGUDU RAMYA",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-304",
    "name": "BHARATAM V RAMA SURYA SHANMUKH",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-305",
    "name": "K AKSHAY KUMAR",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-307",
    "name": "BADAVATH THARUN",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-308",
    "name": "NALLELLA MADHUMITH",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-309",
    "name": "VELDANDI SHIVAMANI",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-310",
    "name": "KADARLA HARSHITHA",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-311",
    "name": "YELLANKI SOUJANYA",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-313",
    "name": "R NIKHILA",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-314",
    "name": "KAMMALAPALLY NANDINI",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-315",
    "name": "KOTTUR JAYADEEP REDDY",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-316",
    "name": "PADEPU BHANU PRASAD",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-317",
    "name": "KATHULA NISHANTH",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-318",
    "name": "KAVIDE RAMU",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-319",
    "name": "THANNEERU TEJASWINI",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-735-320",
    "name": "SANDAVENI RENUKA",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-321",
    "name": "SAPAVAT SAI SINDHU",
    "program": "BE - ECE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-735-322",
    "name": "SINGIREDDY NIKHIL REDDY",
    "program": "BE - ECE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-734-001",
    "name": "LANKA SHREE NISCHALA",
    "program": "BE - EEE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-734-002",
    "name": "MALIGIREDDY LAXMINARSIMHA REDDY",
    "program": "BE - EEE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-734-003",
    "name": "MENTE VINESH SAI MANIKANTA",
    "program": "BE - EEE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-734-004",
    "name": "KAVULOORU CHARITHA",
    "program": "BE - EEE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-734-006",
    "name": "GULLAPALLI GAYATHRI",
    "program": "BE - EEE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-734-007",
    "name": "CHERUPALLY ESHWAR",
    "program": "BE - EEE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-734-008",
    "name": "MADARAMONI GOUTHAM",
    "program": "BE - EEE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-734-011",
    "name": "RAGISHETTI PRAGNYA",
    "program": "BE - EEE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-734-012",
    "name": "MOHAMMED AFROZ",
    "program": "BE - EEE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-734-013",
    "name": "MERUGU AKSHAYA",
    "program": "BE - EEE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-734-014",
    "name": "DASARI MAHENDHAR YADAV",
    "program": "BE - EEE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-734-015",
    "name": "BHUKYA MANJULA",
    "program": "BE - EEE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-734-016",
    "name": "TAMMISETTI BHARGAVI",
    "program": "BE - EEE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-734-017",
    "name": "GAJJI SAI SHASHANK",
    "program": "BE - EEE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-734-018",
    "name": "SILIVERI NAGARAJU",
    "program": "BE - EEE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-734-019",
    "name": "MARATI SUSHMITHA",
    "program": "BE - EEE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-734-020",
    "name": "DONGARI SIDDHARTHA",
    "program": "BE - EEE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-734-023",
    "name": "BANOTH SUPRIYA",
    "program": "BE - EEE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-734-024",
    "name": "NANUPALLY BALA SANTHOSH",
    "program": "BE - EEE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-734-026",
    "name": "ACHINI THANOOJ",
    "program": "BE - EEE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-734-027",
    "name": "BEJADI RAMYA",
    "program": "BE - EEE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-734-028",
    "name": "BANOTH RAVINDER",
    "program": "BE - EEE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-734-029",
    "name": "PATHULOTHU MOTHILAL",
    "program": "BE - EEE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-734-031",
    "name": "CHOWTAKURI SUMEDHA",
    "program": "BE - EEE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-734-032",
    "name": "SRIRAMADASU NAVYASREE",
    "program": "BE - EEE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-734-033",
    "name": "KAMBALAPALLY HARISH KUMAR",
    "program": "BE - EEE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-734-035",
    "name": "PULLURI SNEHA",
    "program": "BE - EEE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-734-036",
    "name": "BANOTHU NANDHINI",
    "program": "BE - EEE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-734-037",
    "name": "BABBURI SAI KEERTHY",
    "program": "BE - EEE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-734-038",
    "name": "REDDYCHERLA RAMYASRI",
    "program": "BE - EEE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-734-039",
    "name": "CHEERLA VINEELA",
    "program": "BE - EEE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-734-043",
    "name": "REDDYGARI RAGHAVENDRA REDDY",
    "program": "BE - EEE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-734-044",
    "name": "G S MURALIKRISHNA",
    "program": "BE - EEE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-734-045",
    "name": "GOLLA SAI BALAJI",
    "program": "BE - EEE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-734-301",
    "name": "POGULA VISHNUVARDHAN",
    "program": "BE - EEE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-734-302",
    "name": "BIRRU DHRUVARAJ",
    "program": "BE - EEE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-734-303",
    "name": "POLOJU RAM PRASAD",
    "program": "BE - EEE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-734-304",
    "name": "CHENNUR SANJANA SRI",
    "program": "BE - EEE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-734-305",
    "name": "NAGELLI THRIVARN",
    "program": "BE - EEE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-734-306",
    "name": "JADI SANJANA",
    "program": "BE - EEE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-734-307",
    "name": "DHARAVATH SABITHA",
    "program": "BE - EEE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-734-308",
    "name": "K CHIRANJEEVI ACHARYA",
    "program": "BE - EEE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-734-309",
    "name": "CHILUKA BHASKAR",
    "program": "BE - EEE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-734-310",
    "name": "KATRAPATI LAKSHMI PRIYANKA",
    "program": "BE - EEE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-734-311",
    "name": "UPPARI MEENAKSHI",
    "program": "BE - EEE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-734-312",
    "name": "GANAPURAM KOTESHWAR",
    "program": "BE - EEE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-734-313",
    "name": "YANDAPALLI KEERTHI SHARMA",
    "program": "BE - EEE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-734-314",
    "name": "AJIMIRA SRI KRISHNA CHAITANYA",
    "program": "BE - EEE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-734-315",
    "name": "MANDULA VENKAT REDDY",
    "program": "BE - EEE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-734-316",
    "name": "PABBA PAVAN KUMAR GOUD",
    "program": "BE - EEE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-734-317",
    "name": "BOINI SHIVA PRASAD",
    "program": "BE - EEE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-734-318",
    "name": "AVULA GAGANA SREE",
    "program": "BE - EEE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-734-320",
    "name": "DASAPATHRI LAXMIPRASANNA",
    "program": "BE - EEE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-734-321",
    "name": "C RAJKUMAR",
    "program": "BE - EEE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-734-322",
    "name": "A NIVEDITHA",
    "program": "BE - EEE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-734-324",
    "name": "KANUGULA SANDEEP",
    "program": "BE - EEE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-734-325",
    "name": "GINUKUNTLA TRINATH GOUD",
    "program": "BE - EEE",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-001",
    "name": "PALSIKAR MAYANK",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-002",
    "name": "KRANTI DHANUSH REDDY",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-003",
    "name": "SANKALP REDDY CHEEMARLA",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-004",
    "name": "CHAVA YASHASRI",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-005",
    "name": "PENTALA RISHITH REDDY",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-006",
    "name": "BITLA SRAVYA REDDY",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-007",
    "name": "THUMMALA VARSHITH REDDY",
    "program": "BE - INF",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-737-008",
    "name": "KAMBHAMPATI VAMSHI KRISHNA",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-009",
    "name": "MALLEPALLY SAI VINAY",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-010",
    "name": "VOOCHA KARTHIKEYA",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-011",
    "name": "VANGAPALLY GODADEVI",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-012",
    "name": "JAYA NANDINI TAPPETA",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-013",
    "name": "MALLU KEERTHI REDDY",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-014",
    "name": "KOYADA SAI SRINATH",
    "program": "BE - INF",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-737-015",
    "name": "PAGIDIMARRI ABHINAV",
    "program": "BE - INF",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-737-016",
    "name": "YERRA SRIHITHA GOUD",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-017",
    "name": "MOTIPETA SAI THARUN",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-018",
    "name": "NYAMALA AISHWARYA",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-019",
    "name": "MUKTHALA NISHANTH",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-020",
    "name": "SAMPATHI VISHNU",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-021",
    "name": "KATTA KARTHIKEYA",
    "program": "BE - INF",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-737-022",
    "name": "VEERUMNENI SAAVANTH",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-023",
    "name": "ARUKALA SAI RAM GOUD",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-024",
    "name": "RAPALLY ANIL KUMAR",
    "program": "BE - INF",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-737-025",
    "name": "GOLLAPATLA SHRIYA",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-026",
    "name": "MOHAMMED KHAJA SHANAWAZ",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-027",
    "name": "RAVIPATI POOJA SHRI MADHULIKA",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-028",
    "name": "GANDIKOTA SUMANTH",
    "program": "BE - INF",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-737-029",
    "name": "ITHARAJU SAI TEJA",
    "program": "BE - INF",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-737-031",
    "name": "SAMREEN BEGUM",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-032",
    "name": "YALAKARAJULA NARASIMHA SWAMY",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-033",
    "name": "KEERTI KOLLA",
    "program": "BE - INF",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-737-034",
    "name": "RAVULA VIVEK REDDY",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-035",
    "name": "MANDHA PAVAN",
    "program": "BE - INF",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-737-036",
    "name": "KADIRE RISHITHA REDDY",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-038",
    "name": "ADELLI DEEPIKA",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-039",
    "name": "MULLA AMERA AFSHA",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-040",
    "name": "THADAMALLA SHOBITH NATHAN",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-041",
    "name": "AAYUSH POTDAR",
    "program": "BE - INF",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-737-042",
    "name": "LAVANYA BUSIREDDY",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-043",
    "name": "MATAKALA DINESH",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-044",
    "name": "SANKOJU INDHU SREE",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-045",
    "name": "GAJJALA MALLAVVA",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-051",
    "name": "YASANI RUSHENDAR REDDY",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-052",
    "name": "YERRAVALLY SAI PRIYA",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-053",
    "name": "POTHARLA SAI SREEHITHA",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-054",
    "name": "KODISHALA THRILOKNATH",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-055",
    "name": "KEVIN JOY THOMAS",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-056",
    "name": "NAMBARU VEERA VENKATA RAMANA",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-057",
    "name": "PEDDINTI HARIKA SAHITYA SINGA KUMARI",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-058",
    "name": "AITHA VAISHNAVI",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-059",
    "name": "ALLU CHETHAN REDDY",
    "program": "BE - INF",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-737-060",
    "name": "GUDIPATI ANUSHA",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-061",
    "name": "BODDU SATWIKA",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-062",
    "name": "GANNARAM DISHA",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-063",
    "name": "ENUGANTI VAISHNAVI",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-064",
    "name": "MUSKU ASHWITHA REDDY",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-065",
    "name": "CHOPPAKATLA SATYA SHRESTA",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-066",
    "name": "VANAMPALLY EEKSHITHA",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-067",
    "name": "SOM ASWITHA",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-068",
    "name": "MAROJU NAVYA SRI",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-069",
    "name": "A RISHITHA",
    "program": "BE - INF",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-737-070",
    "name": "SETTI SHANMUKHA VARSHITH",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-071",
    "name": "VALISHETTI SINDHU",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-072",
    "name": "BODAPATLA BHUVAN",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-073",
    "name": "JELLA RAHUL",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-074",
    "name": "M SHIVA RAMA KRISHNA",
    "program": "BE - INF",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-737-075",
    "name": "UPPUNUTHULA SHIVA PRASAD",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-076",
    "name": "GADDAM LIKITH",
    "program": "BE - INF",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-737-078",
    "name": "RAGIRI AKANKSHA",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-079",
    "name": "RAPARTHI MANASA",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-080",
    "name": "GUNDA BINDUSREE",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-081",
    "name": "GANDU LASYA SRI",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-082",
    "name": "MOHAMMED SOHAIL AHMED",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-083",
    "name": "SHAIK ABDUL AHAD",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-084",
    "name": "RUPANI SACHIN",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-085",
    "name": "MAKTHALA ADITYA",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-086",
    "name": "MAILAPAKA SAI SREE MAHATHI",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-087",
    "name": "KUNDA SAI CHARAN",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-088",
    "name": "C NISHANTH REDDY",
    "program": "BE - INF",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-737-089",
    "name": "KALVA SREE HARSHA REDDY",
    "program": "BE - INF",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-737-090",
    "name": "SAHITHI REDDY LINGAM",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-091",
    "name": "AKULA PRANAY",
    "program": "BE - INF",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-737-092",
    "name": "BRUNDAVAN ESHWAR CHANDRA",
    "program": "BE - INF",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-737-093",
    "name": "BADALA SRIHARSHA",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-094",
    "name": "M SRIVATS",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-095",
    "name": "KONDURU AKSHAYA",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-096",
    "name": "CHITTIPOLU SIRI CHANDANA",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-098",
    "name": "MANNE SRUJAN",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-099",
    "name": "PURANDHARESHWARI KARRE",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-100",
    "name": "CHENGALA NISHANTH",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-102",
    "name": "VARLA HANOK",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-103",
    "name": "SHAIK YASMEEN",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-104",
    "name": "K CHARAN KUMAR REDDY",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-105",
    "name": "KARRA SURYA SAI PRANATHI",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-106",
    "name": "VUPPALA RUCHITHA",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-107",
    "name": "RAPAKA NISSY SOPHIA",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-108",
    "name": "KOMIREDDY VARUN REDDY",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-110",
    "name": "SAI SRINIDHI VEMARAJU",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-111",
    "name": "BAIREDDY SRI RAM REDDY",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-112",
    "name": "VIGRAHALA RAHUL",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-113",
    "name": "CHATA LAKSHMI NARASIMHA",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-120",
    "name": "MANDADI VARUN REDDY",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-121",
    "name": "YEDLA LIKITHA",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-122",
    "name": "SHAIK SAI MARSHIYA",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-124",
    "name": "KONDURU PRAHALADH",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-125",
    "name": "PADIGAPATI PRANAV SAI REDDY",
    "program": "BE - INF",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-737-126",
    "name": "RANGA AKSHITHA",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-127",
    "name": "KALAM PHANI KUMAR REDDY",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-128",
    "name": "VAMARAVELLI BHARATH",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-129",
    "name": "GURRAM SANKEERTHANA",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-130",
    "name": "POTHUGANTI PRANEETHA REDDY",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-131",
    "name": "KONDAPALKULA SARAYU",
    "program": "BE - INF",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-737-132",
    "name": "PALLA PRANAV REDDY",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-133",
    "name": "MULLE MADHURI",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-134",
    "name": "DEVARASETTI DEEKSHITH",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-135",
    "name": "BOMIDIKA ADITHI",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-137",
    "name": "POLISETTI SAHITHI",
    "program": "BE - INF",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-737-138",
    "name": "KESHAMPET AKSHAYA",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-139",
    "name": "VORUGANTI ADITHI MADHAV",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-140",
    "name": "S RISHITHA REDDY",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-141",
    "name": "CHALAMALLA AKSHARA",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-143",
    "name": "ERRAVULA NIHARIKA",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-144",
    "name": "KAKKULURU APEKSHA",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-146",
    "name": "NARASIMHA REDDY KASARLA",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-147",
    "name": "LAGUDU RAM KISHORE",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-148",
    "name": "PALLA TEJASRI",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-149",
    "name": "GANNAVARAM SHAILAJA",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-150",
    "name": "SAI MADHU MUKKERA",
    "program": "BE - INF",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-737-151",
    "name": "APPAM RENUKA SRI",
    "program": "BE - INF",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-737-152",
    "name": "DORNALA POOJA",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-153",
    "name": "PANTHINI SATHVIK",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-155",
    "name": "CHIRRABOINA KALPANA",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-156",
    "name": "ARVAPALLY SPANDANA",
    "program": "BE - INF",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-737-157",
    "name": "GUNTI SRIDEVI",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-159",
    "name": "DYAPA MANIDEEP REDDY",
    "program": "BE - INF",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-737-160",
    "name": "KALLA SUMANTH",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-161",
    "name": "THANNEERU RITWIK",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-162",
    "name": "DOBBALA RAVINDRA BABU",
    "program": "BE - INF",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-737-163",
    "name": "RODDA RAKESH",
    "program": "BE - INF",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-737-164",
    "name": "KATRAVATH SRAVANTHI",
    "program": "BE - INF",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-737-165",
    "name": "LINGANNAGARI PRAJWALA",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-166",
    "name": "MAGANI SREEJA",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-167",
    "name": "NITYASHREE DESHPANDE",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-168",
    "name": "R ANNAPURNA",
    "program": "BE - INF",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-737-169",
    "name": "GUDURU MANSI SAGAR",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-170",
    "name": "PADALA KARTHIK",
    "program": "BE - INF",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-737-171",
    "name": "GUDHATI HARSHINI REDDY",
    "program": "BE - INF",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-737-172",
    "name": "BUDIDHA SINDHU",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-174",
    "name": "MIRYALA SATHWIKA",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-176",
    "name": "YADARAM AKSHAY REDDY",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-177",
    "name": "RASAMALLA VARSHINI",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-178",
    "name": "ENNU AMRUTH REDDY",
    "program": "BE - INF",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-737-180",
    "name": "MEGHANA KOMPELLA",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-184",
    "name": "KOLLAMPALLY AKHILA",
    "program": "BE - INF",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-737-185",
    "name": "SOLIPETA AKSHAY GOUD",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-186",
    "name": "KOMMIDI BHAVANA",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-187",
    "name": "NYAPATHI VISHAL",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-188",
    "name": "THOUDU SAMITH REDDY",
    "program": "BE - INF",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-737-189",
    "name": "VENKATA SAI VEDAVIKAS DAKETI",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-301",
    "name": "PEDDAPALLI RAKESH",
    "program": "BE - INF",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-737-302",
    "name": "MANTRI SANGEETHA",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-303",
    "name": "THALISHETTY SWAPNA",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-304",
    "name": "D SUSHMITHA",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-305",
    "name": "NANDIKONDA NAREAN",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-308",
    "name": "MALLIPEDDI DINAKAR",
    "program": "BE - INF",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-737-309",
    "name": "GORRE THARUN",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-310",
    "name": "MERUGU BALA KRISHNA",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-311",
    "name": "SHYMALA AKSHAYA",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-312",
    "name": "BOLLU KARTHIKEYA",
    "program": "BE - INF",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-737-313",
    "name": "UPPULA VAMSHI",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-314",
    "name": "MANKALA HARIPRASAD",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-315",
    "name": "BONDA SNEHA",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-316",
    "name": "AKANKSHA MOTHUKURI",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-317",
    "name": "PALADI BHARATH RAJ",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-318",
    "name": "GHANAPURAM KAVYA",
    "program": "BE - INF",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-737-319",
    "name": "BOGAM SATHWIK",
    "program": "BE - INF",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-737-320",
    "name": "PALTHYAVATH UMESH CHANDRA NAYAK",
    "program": "BE - INF",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-737-321",
    "name": "SABAVATH ANAND",
    "program": "BE - INF",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-736-001",
    "name": "RAMULA SAINATH REDDY",
    "program": "BE - MEC",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-736-003",
    "name": "NENAVATH ROHITH",
    "program": "BE - MEC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-736-005",
    "name": "KAITHI CHINKY",
    "program": "BE - MEC",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-736-013",
    "name": "CH AJAY",
    "program": "BE - MEC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-736-301",
    "name": "JAGARI KARTHIK",
    "program": "BE - MEC",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-736-302",
    "name": "BANTU MAHESH",
    "program": "BE - MEC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-736-303",
    "name": "J PREM",
    "program": "BE - MEC",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-736-304",
    "name": "ADEPU ADVAITH KEVAL CHANDRA",
    "program": "BE - MEC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-736-306",
    "name": "MOHAMMED NAZIMUDDIN",
    "program": "BE - MEC",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-736-308",
    "name": "MANYAM LIKHITH",
    "program": "BE - MEC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-736-309",
    "name": "GANGILE MAHESH CHANDRA",
    "program": "BE - MEC",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-736-310",
    "name": "P JAHENGEER BHABHA",
    "program": "BE - MEC",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-736-311",
    "name": "KOPPISETTI MAHENDRA NAGA SAI PRASAD",
    "program": "BE - MEC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-736-312",
    "name": "VANAM PRAMOD KUMAR",
    "program": "BE - MEC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-736-313",
    "name": "BODDUPALLY DHEERAJ KUMAR",
    "program": "BE - MEC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-736-314",
    "name": "BANDARU SAI PRANAV",
    "program": "BE - MEC",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-736-315",
    "name": "J AKHIL BABU",
    "program": "BE - MEC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-736-316",
    "name": "BODDUPALLI JAYANTH",
    "program": "BE - MEC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-736-317",
    "name": "SAUELI BHAGYA SREE",
    "program": "BE - MEC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-736-318",
    "name": "Y SIDDHARTHA",
    "program": "BE - MEC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-736-319",
    "name": "POTHEDAR RAJENDRA",
    "program": "BE - MEC",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-736-320",
    "name": "MAMIDIPALLY BHUVAN PRAKASH",
    "program": "BE - MEC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-736-321",
    "name": "NANDIMALA MAHESH",
    "program": "BE - MEC",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-736-322",
    "name": "S AMARNATH",
    "program": "BE - MEC",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-736-323",
    "name": "SHAIK REHAN",
    "program": "BE - MEC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-736-324",
    "name": "KARRE NITIN KUMAR",
    "program": "BE - MEC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-736-325",
    "name": "CHENNADI SAI PRATHAP RAO",
    "program": "BE - MEC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-736-327",
    "name": "KAPPALA VASANTH KUMAR",
    "program": "BE - MEC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-736-328",
    "name": "KADARI BHANUPRASAD YADAV",
    "program": "BE - MEC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-736-329",
    "name": "JENIGE ARAVIND YADAV",
    "program": "BE - MEC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-736-331",
    "name": "G MEGHANA SRI",
    "program": "BE - MEC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-736-332",
    "name": "RAGI SAI KRISHNA",
    "program": "BE - MEC",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-736-334",
    "name": "ELAVENI SANDEEP",
    "program": "BE - MEC",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-736-337",
    "name": "M BHARATH KUMAR REDDY",
    "program": "BE - MEC",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-22-769-001",
    "name": "P VENKATA SRIVATHSA",
    "program": "BE - AUT",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-769-003",
    "name": "CHARIT REDDY KUNDUR",
    "program": "BE - AUT",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-769-004",
    "name": "KUPPALA VISHHWAS",
    "program": "BE - AUT",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-769-005",
    "name": "KONKATA CHAITANYA KUMAR",
    "program": "BE - AUT",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-769-008",
    "name": "LABHISHETTY SREETEJ",
    "program": "BE - AUT",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-769-301",
    "name": "KANAKAM VINAY",
    "program": "BE - AUT",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-769-302",
    "name": "MADIPEDDI JASHWANTH",
    "program": "BE - AUT",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-769-303",
    "name": "BALE DHANANJAYA",
    "program": "BE - AUT",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-769-304",
    "name": "DHARAVATH VAMSHI",
    "program": "BE - AUT",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-769-305",
    "name": "SANGI NIKITHA",
    "program": "BE - AUT",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-22-769-306",
    "name": "D DEEPAK SAI CHARAN YADAV",
    "program": "BE - AUT",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-23-741-001",
    "name": "KETHAVATH KALYAN NAYAK",
    "program": "ME - MECIV",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-741-002",
    "name": "M SARATH CHANDRA",
    "program": "ME - MECIV",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-741-003",
    "name": "JALLELLA PAVAN KUMAR",
    "program": "ME - MECIV",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-741-005",
    "name": "NAKKA ANUSHA",
    "program": "ME - MECIV",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-741-006",
    "name": "MD BILALUDDIN",
    "program": "ME - MECIV",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-741-007",
    "name": "VALLAMDAS PRASANNA",
    "program": "ME - MECIV",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-741-008",
    "name": "A VYSHNAVI",
    "program": "ME - MECIV",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-741-009",
    "name": "NENAVATH VIVEK NAIK",
    "program": "ME - MECIV",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-741-012",
    "name": "MUSKU VIVEK REDDY",
    "program": "ME - MECIV",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-741-013",
    "name": "LANKA TARUN",
    "program": "ME - MECIV",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-741-014",
    "name": "VARAKALA SATHWIKA",
    "program": "ME - MECIV",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-742-001",
    "name": "MOKARALA RAMYAK RISHNA",
    "program": "MTECH - MTCSE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-742-003",
    "name": "SRAVANI BOYAPATI",
    "program": "MTECH - MTCSE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-742-004",
    "name": "ROOPAMANI C",
    "program": "MTECH - MTCSE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-742-006",
    "name": "NAHDIA MARYAM OSMANI",
    "program": "MTECH - MTCSE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-742-007",
    "name": "GAYKOD VAISHNAVI",
    "program": "MTECH - MTCSE",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-744-001",
    "name": "SEGGYEM HEMASREE",
    "program": "ME - MEVLSI",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-744-002",
    "name": "MADUGULA SEETHA RAMAKRISHNA",
    "program": "ME - MEVLSI",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-744-003",
    "name": "KARRI LAKSHMI VAISHNAVI",
    "program": "ME - MEVLSI",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-744-004",
    "name": "G MAHESH",
    "program": "ME - MEVLSI",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-744-006",
    "name": "BILALUDDIN SUFI MOHAMMED",
    "program": "ME - MEVLSI",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-744-007",
    "name": "MANIPATY RENUKA",
    "program": "ME - MEVLSI",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-744-008",
    "name": "LAVORI SAIKIRAN",
    "program": "ME - MEVLSI",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-744-009",
    "name": "PATEL GAUTHAMI",
    "program": "ME - MEVLSI",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-744-010",
    "name": "DESU GEETHA SAI LAKSHMI",
    "program": "ME - MEVLSI",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-744-011",
    "name": "MADHIRA ESWAR VISWANATH",
    "program": "ME - MEVLSI",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-744-012",
    "name": "VEDALA SHARATH",
    "program": "ME - MEVLSI",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-672-001",
    "name": "BACHALA KANAKA RAJU",
    "program": "MBA - MBA",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-672-002",
    "name": "JYOTHI LAVANYA",
    "program": "MBA - MBA",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-672-003",
    "name": "PUTTAGALLA SAI KUMAR",
    "program": "MBA - MBA",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-672-006",
    "name": "JUVERIYA FIRDOUS",
    "program": "MBA - MBA",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-672-007",
    "name": "SHAIK SHAHEEN BEGUM",
    "program": "MBA - MBA",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-23-672-008",
    "name": "JAMAL ABHINAY",
    "program": "MBA - MBA",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-672-009",
    "name": "SANDHA NAVYA SAGAR",
    "program": "MBA - MBA",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-672-010",
    "name": "PALUBAI ANKITH",
    "program": "MBA - MBA",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-672-011",
    "name": "MEKALA LIKITHA",
    "program": "MBA - MBA",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-672-012",
    "name": "PARANDA CHANDRA KANTH",
    "program": "MBA - MBA",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-672-013",
    "name": "TALLATI SUKEERTHI",
    "program": "MBA - MBA",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-672-014",
    "name": "VARKOLU PRAJASHWINI",
    "program": "MBA - MBA",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-672-015",
    "name": "ANDEKAR ROOPA",
    "program": "MBA - MBA",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-672-016",
    "name": "PATHURI SATHWIKA",
    "program": "MBA - MBA",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-672-017",
    "name": "GANTA MYTHRI REDDY",
    "program": "MBA - MBA",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-672-018",
    "name": "MALGANI MEGHA SREE",
    "program": "MBA - MBA",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-23-672-020",
    "name": "UTTERAPALLY SREENIDHI",
    "program": "MBA - MBA",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-672-021",
    "name": "YELLIGADALA PRANEESH",
    "program": "MBA - MBA",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-672-022",
    "name": "SAI PRIYA VALLICHATTY",
    "program": "MBA - MBA",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-672-024",
    "name": "KAMATI MANISH",
    "program": "MBA - MBA",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-672-025",
    "name": "KOMARA MOUNIKA",
    "program": "MBA - MBA",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-672-027",
    "name": "DASARI DEVI PRIYA",
    "program": "MBA - MBA",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-672-028",
    "name": "KARRE SINDHUJA",
    "program": "MBA - MBA",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-672-029",
    "name": "MOGILIGIDDA AASRITHA",
    "program": "MBA - MBA",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-672-031",
    "name": "NALLURI KEERTHI",
    "program": "MBA - MBA",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-672-032",
    "name": "LANGARU HARIKA",
    "program": "MBA - MBA",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-672-033",
    "name": "SOLAPUR ROHITH",
    "program": "MBA - MBA",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-672-034",
    "name": "DHARAVATH BHOOMIKA",
    "program": "MBA - MBA",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-672-035",
    "name": "THALLAPALLI RACHANA",
    "program": "MBA - MBA",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-672-036",
    "name": "NARA YUVA KISHORE",
    "program": "MBA - MBA",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-672-037",
    "name": "BOBBILI NEHA",
    "program": "MBA - MBA",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-672-039",
    "name": "ESLAVATH GANESH",
    "program": "MBA - MBA",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-672-040",
    "name": "AMGOTH ANUSHA",
    "program": "MBA - MBA",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-672-041",
    "name": "KUNCHALA SANDEEP",
    "program": "MBA - MBA",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-672-042",
    "name": "RAMAVATH GEETHA KRISHNA",
    "program": "MBA - MBA",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-672-043",
    "name": "RATHLAVATH RAJU",
    "program": "MBA - MBA",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-672-044",
    "name": "JATAVATH HIMANSHU VISHAL",
    "program": "MBA - MBA",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-672-045",
    "name": "NAINALA NIKITHA",
    "program": "MBA - MBA",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-672-047",
    "name": "POTTABATHNI SANJANA",
    "program": "MBA - MBA",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-672-048",
    "name": "REDDIGARI KEERTHI REDDY",
    "program": "MBA - MBA",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-672-049",
    "name": "KANCHIBOTLA TRISHATHI MRUNALINI",
    "program": "MBA - MBA",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-672-050",
    "name": "CHOPPARA AKHIL",
    "program": "MBA - MBA",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-672-051",
    "name": "PIRATLA SHRAVYA",
    "program": "MBA - MBA",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-672-052",
    "name": "BOYELLA RUSHIKESHAVA REDDY",
    "program": "MBA - MBA",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-672-053",
    "name": "BITLA HARINI",
    "program": "MBA - MBA",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-672-054",
    "name": "GUDIPATI AASRITHA",
    "program": "MBA - MBA",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-672-055",
    "name": "BIBINAGAR SAI NITIN",
    "program": "MBA - MBA",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-672-056",
    "name": "GOLI VASANTH",
    "program": "MBA - MBA",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-672-057",
    "name": "MUNAGALA SUPRIYA",
    "program": "MBA - MBA",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-672-058",
    "name": "SATAVILLI VAGDEV SAI KEERTHAN",
    "program": "MBA - MBA",
    "paymentStatus": "Paid"
  },
  {
    "studentId": "2451-23-672-060",
    "name": "R SHREEDEVI",
    "program": "MBA - MBA",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-672-061",
    "name": "KANDALA KRISHNA CHAITHANYA REDDY",
    "program": "MBA - MBA",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-672-062",
    "name": "MANGASOMAYAJULA MANASVINI",
    "program": "MBA - MBA",
    "paymentStatus": "Not Paid"
  },
  {
    "studentId": "2451-23-672-063",
    "name": "KORRA RAHUL SINGH NAYAK",
    "program": "MBA - MBA",
    "paymentStatus": "Not Paid"
  }
];

async function main() {
  console.log('[Seed] Seeding 910 official MVSR candidates from master document...');

  // Create Admin user
  const adminPasswordHash = hashPassword('Admin@2026Password!');
  await prisma.user.upsert({
    where: { username: 'admin@graduation.edu' },
    update: {},
    create: {
      username: 'admin@graduation.edu',
      passwordHash: adminPasswordHash,
      name: 'Graduation Admin',
      role: 'ADMIN',
    },
  });

  // Create default Graduation Event
  const defaultEvent = await prisma.event.upsert({
    where: { slug: 'attendance' },
    update: { isActive: true },
    create: {
      slug: 'attendance',
      name: 'Graduation Day 2026',
      description: 'Official Entrance Attendance for Graduation Day 2026 Candidates',
      isActive: true,
    },
  });

  console.log(`[Seed] Default Event Active: ${defaultEvent.name} (${defaultEvent.slug})`);

  // Clear existing records
  await prisma.attendance.deleteMany();
  await prisma.qrToken.deleteMany();
  await prisma.candidate.deleteMany();

  const candidatesData = [];

  // 1. Mandatory E2E Test Cases (GD001 - GD004)
  const testCandidates = [
    { studentId: 'GD001', name: 'Candidate A (Paid)', program: 'BE - CSE', paymentStatus: 'Paid' },
    { studentId: 'GD002', name: 'Candidate B (Not Paid)', program: 'BE - CIV', paymentStatus: 'Not Paid' },
    { studentId: 'GD003', name: 'Candidate C (Partially Paid)', program: 'BE - ECE', paymentStatus: 'Partially Paid' },
    { studentId: 'GD004', name: 'Candidate D (Typo Variation)', program: 'BE - MEC', paymentStatus: 'Partiallly Paid' },
  ];

  for (const tc of testCandidates) {
    const { normalizedStatus } = normalizePaymentStatus(tc.paymentStatus);
    const eligible = calculateEligibility(normalizedStatus);
    candidatesData.push({
      studentId: tc.studentId,
      name: tc.name,
      program: tc.program,
      paymentStatus: tc.paymentStatus,
      normalizedPaymentStatus: normalizedStatus,
      eligibilityStatus: eligible,
      registrationStatus: 'NOT_REGISTERED',
    });
  }

  // 2. Official Candidates from Master Document
  for (const item of OFFICIAL_CANDIDATES) {
    const { normalizedStatus } = normalizePaymentStatus(item.paymentStatus);
    const eligible = calculateEligibility(normalizedStatus);
    candidatesData.push({
      studentId: item.studentId,
      name: item.name,
      program: item.program,
      paymentStatus: item.paymentStatus,
      normalizedPaymentStatus: normalizedStatus,
      eligibilityStatus: eligible,
      registrationStatus: 'NOT_REGISTERED',
    });
  }

  // Insert in batches of 100
  for (let i = 0; i < candidatesData.length; i += 100) {
    const batch = candidatesData.slice(i, i + 100);
    await prisma.candidate.createMany({
      data: batch,
    });
  }

  const total = await prisma.candidate.count();
  const eligibleCount = await prisma.candidate.count({ where: { eligibilityStatus: true } });
  const notEligibleCount = await prisma.candidate.count({ where: { eligibilityStatus: false } });

  console.log('---------------------------------------------------');
  console.log(`[Seed Complete] Official MVSR Candidate Statistics:`);
  console.log(` Total Candidates:     ${total}`);
  console.log(` Eligible Candidates:   ${eligibleCount}`);
  console.log(` Not Eligible:         ${notEligibleCount}`);
  console.log('---------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('Error seeding dataset:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
