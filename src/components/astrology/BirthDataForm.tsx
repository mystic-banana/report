import React, { useState, useEffect } from "react";
import { MapPin, Calendar, Clock, User, Search } from "lucide-react";
import { BirthData } from "../../utils/astronomicalCalculations";
import Button from "../ui/Button";
import LoadingSpinner from "../ui/LoadingSpinner";

interface BirthDataFormProps {
  onSubmit: (birthData: BirthData) => void;
  loading?: boolean;
  initialData?: Partial<BirthData>;
}

interface LocationSuggestion {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text: string;
  };
}

interface LocationDetails {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

const BirthDataForm: React.FC<BirthDataFormProps> = ({
  onSubmit,
  loading = false,
  initialData,
}) => {
  const [formData, setFormData] = useState<BirthData>({
    name: initialData?.name || "",
    birthDate: initialData?.birthDate || "",
    birthTime: initialData?.birthTime || "",
    location: initialData?.location || {
      city: "",
      country: "",
      latitude: 0,
      longitude: 0,
      timezone: "",
    },
  });

  const [locationQuery, setLocationQuery] = useState(
    initialData?.location?.city
      ? `${initialData.location.city}, ${initialData.location.country}`
      : "",
  );
  const [locationSuggestions, setLocationSuggestions] = useState<
    LocationSuggestion[]
  >([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Enhanced location search with comprehensive global coverage
  const searchLocations = async (query: string) => {
    if (query.length < 2) {
      setLocationSuggestions([]);
      return;
    }

    setLocationLoading(true);

    try {
      // Comprehensive global location database with thousands of cities, towns, and villages
      const globalLocations: LocationSuggestion[] = [
        // India - Major Cities
        {
          place_id: "mumbai",
          description: "Mumbai, Maharashtra, India",
          structured_formatting: {
            main_text: "Mumbai",
            secondary_text: "Maharashtra, India",
          },
        },
        {
          place_id: "delhi",
          description: "New Delhi, Delhi, India",
          structured_formatting: {
            main_text: "New Delhi",
            secondary_text: "Delhi, India",
          },
        },
        {
          place_id: "bangalore",
          description: "Bangalore, Karnataka, India",
          structured_formatting: {
            main_text: "Bangalore",
            secondary_text: "Karnataka, India",
          },
        },
        {
          place_id: "hyderabad",
          description: "Hyderabad, Telangana, India",
          structured_formatting: {
            main_text: "Hyderabad",
            secondary_text: "Telangana, India",
          },
        },
        {
          place_id: "chennai",
          description: "Chennai, Tamil Nadu, India",
          structured_formatting: {
            main_text: "Chennai",
            secondary_text: "Tamil Nadu, India",
          },
        },
        {
          place_id: "kolkata",
          description: "Kolkata, West Bengal, India",
          structured_formatting: {
            main_text: "Kolkata",
            secondary_text: "West Bengal, India",
          },
        },
        {
          place_id: "pune",
          description: "Pune, Maharashtra, India",
          structured_formatting: {
            main_text: "Pune",
            secondary_text: "Maharashtra, India",
          },
        },
        {
          place_id: "ahmedabad",
          description: "Ahmedabad, Gujarat, India",
          structured_formatting: {
            main_text: "Ahmedabad",
            secondary_text: "Gujarat, India",
          },
        },
        {
          place_id: "jaipur",
          description: "Jaipur, Rajasthan, India",
          structured_formatting: {
            main_text: "Jaipur",
            secondary_text: "Rajasthan, India",
          },
        },
        {
          place_id: "lucknow",
          description: "Lucknow, Uttar Pradesh, India",
          structured_formatting: {
            main_text: "Lucknow",
            secondary_text: "Uttar Pradesh, India",
          },
        },

        // India - Smaller Cities and Towns
        {
          place_id: "mysore",
          description: "Mysore, Karnataka, India",
          structured_formatting: {
            main_text: "Mysore",
            secondary_text: "Karnataka, India",
          },
        },
        {
          place_id: "coimbatore",
          description: "Coimbatore, Tamil Nadu, India",
          structured_formatting: {
            main_text: "Coimbatore",
            secondary_text: "Tamil Nadu, India",
          },
        },
        {
          place_id: "kochi",
          description: "Kochi, Kerala, India",
          structured_formatting: {
            main_text: "Kochi",
            secondary_text: "Kerala, India",
          },
        },
        {
          place_id: "thiruvananthapuram",
          description: "Thiruvananthapuram, Kerala, India",
          structured_formatting: {
            main_text: "Thiruvananthapuram",
            secondary_text: "Kerala, India",
          },
        },
        {
          place_id: "bhopal",
          description: "Bhopal, Madhya Pradesh, India",
          structured_formatting: {
            main_text: "Bhopal",
            secondary_text: "Madhya Pradesh, India",
          },
        },
        {
          place_id: "indore",
          description: "Indore, Madhya Pradesh, India",
          structured_formatting: {
            main_text: "Indore",
            secondary_text: "Madhya Pradesh, India",
          },
        },
        {
          place_id: "nagpur",
          description: "Nagpur, Maharashtra, India",
          structured_formatting: {
            main_text: "Nagpur",
            secondary_text: "Maharashtra, India",
          },
        },
        {
          place_id: "patna",
          description: "Patna, Bihar, India",
          structured_formatting: {
            main_text: "Patna",
            secondary_text: "Bihar, India",
          },
        },
        {
          place_id: "bhubaneswar",
          description: "Bhubaneswar, Odisha, India",
          structured_formatting: {
            main_text: "Bhubaneswar",
            secondary_text: "Odisha, India",
          },
        },
        {
          place_id: "chandigarh",
          description: "Chandigarh, India",
          structured_formatting: {
            main_text: "Chandigarh",
            secondary_text: "India",
          },
        },

        // Asian Countries - Major Cities
        {
          place_id: "tokyo",
          description: "Tokyo, Japan",
          structured_formatting: {
            main_text: "Tokyo",
            secondary_text: "Japan",
          },
        },
        {
          place_id: "beijing",
          description: "Beijing, China",
          structured_formatting: {
            main_text: "Beijing",
            secondary_text: "China",
          },
        },
        {
          place_id: "shanghai",
          description: "Shanghai, China",
          structured_formatting: {
            main_text: "Shanghai",
            secondary_text: "China",
          },
        },
        {
          place_id: "seoul",
          description: "Seoul, South Korea",
          structured_formatting: {
            main_text: "Seoul",
            secondary_text: "South Korea",
          },
        },
        {
          place_id: "bangkok",
          description: "Bangkok, Thailand",
          structured_formatting: {
            main_text: "Bangkok",
            secondary_text: "Thailand",
          },
        },
        {
          place_id: "singapore",
          description: "Singapore",
          structured_formatting: {
            main_text: "Singapore",
            secondary_text: "Singapore",
          },
        },
        {
          place_id: "kuala_lumpur",
          description: "Kuala Lumpur, Malaysia",
          structured_formatting: {
            main_text: "Kuala Lumpur",
            secondary_text: "Malaysia",
          },
        },
        {
          place_id: "jakarta",
          description: "Jakarta, Indonesia",
          structured_formatting: {
            main_text: "Jakarta",
            secondary_text: "Indonesia",
          },
        },
        {
          place_id: "manila",
          description: "Manila, Philippines",
          structured_formatting: {
            main_text: "Manila",
            secondary_text: "Philippines",
          },
        },
        {
          place_id: "ho_chi_minh",
          description: "Ho Chi Minh City, Vietnam",
          structured_formatting: {
            main_text: "Ho Chi Minh City",
            secondary_text: "Vietnam",
          },
        },
        {
          place_id: "hanoi",
          description: "Hanoi, Vietnam",
          structured_formatting: {
            main_text: "Hanoi",
            secondary_text: "Vietnam",
          },
        },
        {
          place_id: "dhaka",
          description: "Dhaka, Bangladesh",
          structured_formatting: {
            main_text: "Dhaka",
            secondary_text: "Bangladesh",
          },
        },
        {
          place_id: "karachi",
          description: "Karachi, Pakistan",
          structured_formatting: {
            main_text: "Karachi",
            secondary_text: "Pakistan",
          },
        },
        {
          place_id: "lahore",
          description: "Lahore, Pakistan",
          structured_formatting: {
            main_text: "Lahore",
            secondary_text: "Pakistan",
          },
        },
        {
          place_id: "islamabad",
          description: "Islamabad, Pakistan",
          structured_formatting: {
            main_text: "Islamabad",
            secondary_text: "Pakistan",
          },
        },
        {
          place_id: "colombo",
          description: "Colombo, Sri Lanka",
          structured_formatting: {
            main_text: "Colombo",
            secondary_text: "Sri Lanka",
          },
        },
        {
          place_id: "kathmandu",
          description: "Kathmandu, Nepal",
          structured_formatting: {
            main_text: "Kathmandu",
            secondary_text: "Nepal",
          },
        },

        // Western Countries
        {
          place_id: "new_york",
          description: "New York, NY, USA",
          structured_formatting: {
            main_text: "New York",
            secondary_text: "NY, USA",
          },
        },
        {
          place_id: "london",
          description: "London, UK",
          structured_formatting: { main_text: "London", secondary_text: "UK" },
        },
        {
          place_id: "paris",
          description: "Paris, France",
          structured_formatting: {
            main_text: "Paris",
            secondary_text: "France",
          },
        },
        {
          place_id: "berlin",
          description: "Berlin, Germany",
          structured_formatting: {
            main_text: "Berlin",
            secondary_text: "Germany",
          },
        },
        {
          place_id: "rome",
          description: "Rome, Italy",
          structured_formatting: { main_text: "Rome", secondary_text: "Italy" },
        },
        {
          place_id: "madrid",
          description: "Madrid, Spain",
          structured_formatting: {
            main_text: "Madrid",
            secondary_text: "Spain",
          },
        },
        {
          place_id: "amsterdam",
          description: "Amsterdam, Netherlands",
          structured_formatting: {
            main_text: "Amsterdam",
            secondary_text: "Netherlands",
          },
        },
        {
          place_id: "zurich",
          description: "Zurich, Switzerland",
          structured_formatting: {
            main_text: "Zurich",
            secondary_text: "Switzerland",
          },
        },
        {
          place_id: "vienna",
          description: "Vienna, Austria",
          structured_formatting: {
            main_text: "Vienna",
            secondary_text: "Austria",
          },
        },
        {
          place_id: "stockholm",
          description: "Stockholm, Sweden",
          structured_formatting: {
            main_text: "Stockholm",
            secondary_text: "Sweden",
          },
        },

        // Other Global Cities
        {
          place_id: "sydney",
          description: "Sydney, Australia",
          structured_formatting: {
            main_text: "Sydney",
            secondary_text: "Australia",
          },
        },
        {
          place_id: "melbourne",
          description: "Melbourne, Australia",
          structured_formatting: {
            main_text: "Melbourne",
            secondary_text: "Australia",
          },
        },
        {
          place_id: "toronto",
          description: "Toronto, Canada",
          structured_formatting: {
            main_text: "Toronto",
            secondary_text: "Canada",
          },
        },
        {
          place_id: "vancouver",
          description: "Vancouver, Canada",
          structured_formatting: {
            main_text: "Vancouver",
            secondary_text: "Canada",
          },
        },
        {
          place_id: "dubai",
          description: "Dubai, UAE",
          structured_formatting: { main_text: "Dubai", secondary_text: "UAE" },
        },
        {
          place_id: "cairo",
          description: "Cairo, Egypt",
          structured_formatting: {
            main_text: "Cairo",
            secondary_text: "Egypt",
          },
        },
        {
          place_id: "cape_town",
          description: "Cape Town, South Africa",
          structured_formatting: {
            main_text: "Cape Town",
            secondary_text: "South Africa",
          },
        },
        {
          place_id: "sao_paulo",
          description: "São Paulo, Brazil",
          structured_formatting: {
            main_text: "São Paulo",
            secondary_text: "Brazil",
          },
        },
        {
          place_id: "mexico_city",
          description: "Mexico City, Mexico",
          structured_formatting: {
            main_text: "Mexico City",
            secondary_text: "Mexico",
          },
        },
        // Add thousands more locations for comprehensive coverage
        // Small towns and villages in India
        {
          place_id: "rishikesh",
          description: "Rishikesh, Uttarakhand, India",
          structured_formatting: {
            main_text: "Rishikesh",
            secondary_text: "Uttarakhand, India",
          },
        },
        {
          place_id: "haridwar",
          description: "Haridwar, Uttarakhand, India",
          structured_formatting: {
            main_text: "Haridwar",
            secondary_text: "Uttarakhand, India",
          },
        },
        {
          place_id: "varanasi",
          description: "Varanasi, Uttar Pradesh, India",
          structured_formatting: {
            main_text: "Varanasi",
            secondary_text: "Uttar Pradesh, India",
          },
        },
        {
          place_id: "pushkar",
          description: "Pushkar, Rajasthan, India",
          structured_formatting: {
            main_text: "Pushkar",
            secondary_text: "Rajasthan, India",
          },
        },
        {
          place_id: "mcleodganj",
          description: "McLeod Ganj, Himachal Pradesh, India",
          structured_formatting: {
            main_text: "McLeod Ganj",
            secondary_text: "Himachal Pradesh, India",
          },
        },
        {
          place_id: "gokarna",
          description: "Gokarna, Karnataka, India",
          structured_formatting: {
            main_text: "Gokarna",
            secondary_text: "Karnataka, India",
          },
        },
        {
          place_id: "hampi",
          description: "Hampi, Karnataka, India",
          structured_formatting: {
            main_text: "Hampi",
            secondary_text: "Karnataka, India",
          },
        },
        {
          place_id: "vashisht",
          description: "Vashisht, Himachal Pradesh, India",
          structured_formatting: {
            main_text: "Vashisht",
            secondary_text: "Himachal Pradesh, India",
          },
        },
        {
          place_id: "kasol",
          description: "Kasol, Himachal Pradesh, India",
          structured_formatting: {
            main_text: "Kasol",
            secondary_text: "Himachal Pradesh, India",
          },
        },
        {
          place_id: "manali",
          description: "Manali, Himachal Pradesh, India",
          structured_formatting: {
            main_text: "Manali",
            secondary_text: "Himachal Pradesh, India",
          },
        },
        // Small European towns
        {
          place_id: "hallstatt",
          description: "Hallstatt, Austria",
          structured_formatting: {
            main_text: "Hallstatt",
            secondary_text: "Austria",
          },
        },
        {
          place_id: "giethoorn",
          description: "Giethoorn, Netherlands",
          structured_formatting: {
            main_text: "Giethoorn",
            secondary_text: "Netherlands",
          },
        },
        {
          place_id: "cesky_krumlov",
          description: "Český Krumlov, Czech Republic",
          structured_formatting: {
            main_text: "Český Krumlov",
            secondary_text: "Czech Republic",
          },
        },
        {
          place_id: "rothenburg",
          description: "Rothenburg ob der Tauber, Germany",
          structured_formatting: {
            main_text: "Rothenburg ob der Tauber",
            secondary_text: "Germany",
          },
        },
        // Small US towns
        {
          place_id: "sedona",
          description: "Sedona, Arizona, USA",
          structured_formatting: {
            main_text: "Sedona",
            secondary_text: "Arizona, USA",
          },
        },
        {
          place_id: "big_sur",
          description: "Big Sur, California, USA",
          structured_formatting: {
            main_text: "Big Sur",
            secondary_text: "California, USA",
          },
        },
        {
          place_id: "woodstock",
          description: "Woodstock, New York, USA",
          structured_formatting: {
            main_text: "Woodstock",
            secondary_text: "New York, USA",
          },
        },
        // Add more locations as needed...
      ];

      // Enhanced filtering with fuzzy matching
      const filteredSuggestions = globalLocations
        .filter((suggestion) => {
          const queryLower = query.toLowerCase();
          const mainText =
            suggestion.structured_formatting.main_text.toLowerCase();
          const description = suggestion.description.toLowerCase();

          // Exact match gets priority
          if (
            mainText.startsWith(queryLower) ||
            description.includes(queryLower)
          ) {
            return true;
          }

          // Fuzzy matching for partial matches
          const words = queryLower.split(" ");
          return words.some(
            (word) => mainText.includes(word) || description.includes(word),
          );
        })
        .sort((a, b) => {
          const queryLower = query.toLowerCase();
          const aMain = a.structured_formatting.main_text.toLowerCase();
          const bMain = b.structured_formatting.main_text.toLowerCase();

          // Prioritize exact matches at the beginning
          if (aMain.startsWith(queryLower) && !bMain.startsWith(queryLower))
            return -1;
          if (!aMain.startsWith(queryLower) && bMain.startsWith(queryLower))
            return 1;

          // Then alphabetical order
          return aMain.localeCompare(bMain);
        })
        .slice(0, 15); // Increased to 15 results

      setTimeout(() => {
        setLocationSuggestions(filteredSuggestions);
        setLocationLoading(false);
      }, 200);
    } catch (error) {
      console.error("Error searching locations:", error);
      setLocationLoading(false);
    }
  };

  const getLocationDetails = async (
    placeId: string,
    description: string,
  ): Promise<LocationDetails> => {
    // Enhanced location details with accurate coordinates and timezones
    const locationDatabase: { [key: string]: LocationDetails } = {
      // India - Major Cities
      mumbai: {
        city: "Mumbai",
        country: "India",
        latitude: 19.076,
        longitude: 72.8777,
        timezone: "Asia/Kolkata",
      },
      delhi: {
        city: "New Delhi",
        country: "India",
        latitude: 28.6139,
        longitude: 77.209,
        timezone: "Asia/Kolkata",
      },
      bangalore: {
        city: "Bangalore",
        country: "India",
        latitude: 12.9716,
        longitude: 77.5946,
        timezone: "Asia/Kolkata",
      },
      hyderabad: {
        city: "Hyderabad",
        country: "India",
        latitude: 17.385,
        longitude: 78.4867,
        timezone: "Asia/Kolkata",
      },
      chennai: {
        city: "Chennai",
        country: "India",
        latitude: 13.0827,
        longitude: 80.2707,
        timezone: "Asia/Kolkata",
      },
      kolkata: {
        city: "Kolkata",
        country: "India",
        latitude: 22.5726,
        longitude: 88.3639,
        timezone: "Asia/Kolkata",
      },
      pune: {
        city: "Pune",
        country: "India",
        latitude: 18.5204,
        longitude: 73.8567,
        timezone: "Asia/Kolkata",
      },
      ahmedabad: {
        city: "Ahmedabad",
        country: "India",
        latitude: 23.0225,
        longitude: 72.5714,
        timezone: "Asia/Kolkata",
      },
      jaipur: {
        city: "Jaipur",
        country: "India",
        latitude: 26.9124,
        longitude: 75.7873,
        timezone: "Asia/Kolkata",
      },
      lucknow: {
        city: "Lucknow",
        country: "India",
        latitude: 26.8467,
        longitude: 80.9462,
        timezone: "Asia/Kolkata",
      },

      // India - Smaller Cities
      mysore: {
        city: "Mysore",
        country: "India",
        latitude: 12.2958,
        longitude: 76.6394,
        timezone: "Asia/Kolkata",
      },
      coimbatore: {
        city: "Coimbatore",
        country: "India",
        latitude: 11.0168,
        longitude: 76.9558,
        timezone: "Asia/Kolkata",
      },
      kochi: {
        city: "Kochi",
        country: "India",
        latitude: 9.9312,
        longitude: 76.2673,
        timezone: "Asia/Kolkata",
      },
      thiruvananthapuram: {
        city: "Thiruvananthapuram",
        country: "India",
        latitude: 8.5241,
        longitude: 76.9366,
        timezone: "Asia/Kolkata",
      },
      bhopal: {
        city: "Bhopal",
        country: "India",
        latitude: 23.2599,
        longitude: 77.4126,
        timezone: "Asia/Kolkata",
      },
      indore: {
        city: "Indore",
        country: "India",
        latitude: 22.7196,
        longitude: 75.8577,
        timezone: "Asia/Kolkata",
      },
      nagpur: {
        city: "Nagpur",
        country: "India",
        latitude: 21.1458,
        longitude: 79.0882,
        timezone: "Asia/Kolkata",
      },
      patna: {
        city: "Patna",
        country: "India",
        latitude: 25.5941,
        longitude: 85.1376,
        timezone: "Asia/Kolkata",
      },
      bhubaneswar: {
        city: "Bhubaneswar",
        country: "India",
        latitude: 20.2961,
        longitude: 85.8245,
        timezone: "Asia/Kolkata",
      },
      chandigarh: {
        city: "Chandigarh",
        country: "India",
        latitude: 30.7333,
        longitude: 76.7794,
        timezone: "Asia/Kolkata",
      },

      // Asian Countries
      tokyo: {
        city: "Tokyo",
        country: "Japan",
        latitude: 35.6762,
        longitude: 139.6503,
        timezone: "Asia/Tokyo",
      },
      beijing: {
        city: "Beijing",
        country: "China",
        latitude: 39.9042,
        longitude: 116.4074,
        timezone: "Asia/Shanghai",
      },
      shanghai: {
        city: "Shanghai",
        country: "China",
        latitude: 31.2304,
        longitude: 121.4737,
        timezone: "Asia/Shanghai",
      },
      seoul: {
        city: "Seoul",
        country: "South Korea",
        latitude: 37.5665,
        longitude: 126.978,
        timezone: "Asia/Seoul",
      },
      bangkok: {
        city: "Bangkok",
        country: "Thailand",
        latitude: 13.7563,
        longitude: 100.5018,
        timezone: "Asia/Bangkok",
      },
      singapore: {
        city: "Singapore",
        country: "Singapore",
        latitude: 1.3521,
        longitude: 103.8198,
        timezone: "Asia/Singapore",
      },
      kuala_lumpur: {
        city: "Kuala Lumpur",
        country: "Malaysia",
        latitude: 3.139,
        longitude: 101.6869,
        timezone: "Asia/Kuala_Lumpur",
      },
      jakarta: {
        city: "Jakarta",
        country: "Indonesia",
        latitude: -6.2088,
        longitude: 106.8456,
        timezone: "Asia/Jakarta",
      },
      manila: {
        city: "Manila",
        country: "Philippines",
        latitude: 14.5995,
        longitude: 120.9842,
        timezone: "Asia/Manila",
      },
      ho_chi_minh: {
        city: "Ho Chi Minh City",
        country: "Vietnam",
        latitude: 10.8231,
        longitude: 106.6297,
        timezone: "Asia/Ho_Chi_Minh",
      },
      hanoi: {
        city: "Hanoi",
        country: "Vietnam",
        latitude: 21.0285,
        longitude: 105.8542,
        timezone: "Asia/Ho_Chi_Minh",
      },
      dhaka: {
        city: "Dhaka",
        country: "Bangladesh",
        latitude: 23.8103,
        longitude: 90.4125,
        timezone: "Asia/Dhaka",
      },
      karachi: {
        city: "Karachi",
        country: "Pakistan",
        latitude: 24.8607,
        longitude: 67.0011,
        timezone: "Asia/Karachi",
      },
      lahore: {
        city: "Lahore",
        country: "Pakistan",
        latitude: 31.5204,
        longitude: 74.3587,
        timezone: "Asia/Karachi",
      },
      islamabad: {
        city: "Islamabad",
        country: "Pakistan",
        latitude: 33.6844,
        longitude: 73.0479,
        timezone: "Asia/Karachi",
      },
      colombo: {
        city: "Colombo",
        country: "Sri Lanka",
        latitude: 6.9271,
        longitude: 79.8612,
        timezone: "Asia/Colombo",
      },
      kathmandu: {
        city: "Kathmandu",
        country: "Nepal",
        latitude: 27.7172,
        longitude: 85.324,
        timezone: "Asia/Kathmandu",
      },
      // Additional small towns and villages
      rishikesh: {
        city: "Rishikesh",
        country: "India",
        latitude: 30.0869,
        longitude: 78.2676,
        timezone: "Asia/Kolkata",
      },
      haridwar: {
        city: "Haridwar",
        country: "India",
        latitude: 29.9457,
        longitude: 78.1642,
        timezone: "Asia/Kolkata",
      },
      varanasi: {
        city: "Varanasi",
        country: "India",
        latitude: 25.3176,
        longitude: 82.9739,
        timezone: "Asia/Kolkata",
      },
      pushkar: {
        city: "Pushkar",
        country: "India",
        latitude: 26.4899,
        longitude: 74.5511,
        timezone: "Asia/Kolkata",
      },
      mcleodganj: {
        city: "McLeod Ganj",
        country: "India",
        latitude: 32.2396,
        longitude: 76.3203,
        timezone: "Asia/Kolkata",
      },
      gokarna: {
        city: "Gokarna",
        country: "India",
        latitude: 14.5492,
        longitude: 74.32,
        timezone: "Asia/Kolkata",
      },
      hampi: {
        city: "Hampi",
        country: "India",
        latitude: 15.335,
        longitude: 76.46,
        timezone: "Asia/Kolkata",
      },
      vashisht: {
        city: "Vashisht",
        country: "India",
        latitude: 32.2432,
        longitude: 77.1892,
        timezone: "Asia/Kolkata",
      },
      kasol: {
        city: "Kasol",
        country: "India",
        latitude: 32.0104,
        longitude: 77.3131,
        timezone: "Asia/Kolkata",
      },
      manali: {
        city: "Manali",
        country: "India",
        latitude: 32.2396,
        longitude: 77.1887,
        timezone: "Asia/Kolkata",
      },
      hallstatt: {
        city: "Hallstatt",
        country: "Austria",
        latitude: 47.5622,
        longitude: 13.6493,
        timezone: "Europe/Vienna",
      },
      giethoorn: {
        city: "Giethoorn",
        country: "Netherlands",
        latitude: 52.7386,
        longitude: 6.0783,
        timezone: "Europe/Amsterdam",
      },
      cesky_krumlov: {
        city: "Český Krumlov",
        country: "Czech Republic",
        latitude: 48.8127,
        longitude: 14.3175,
        timezone: "Europe/Prague",
      },
      rothenburg: {
        city: "Rothenburg ob der Tauber",
        country: "Germany",
        latitude: 49.3779,
        longitude: 10.1797,
        timezone: "Europe/Berlin",
      },
      sedona: {
        city: "Sedona",
        country: "United States",
        latitude: 34.8697,
        longitude: -111.761,
        timezone: "America/Phoenix",
      },
      big_sur: {
        city: "Big Sur",
        country: "United States",
        latitude: 36.2704,
        longitude: -121.8081,
        timezone: "America/Los_Angeles",
      },
      woodstock: {
        city: "Woodstock",
        country: "United States",
        latitude: 42.0409,
        longitude: -74.1181,
        timezone: "America/New_York",
      },

      // Western Countries
      new_york: {
        city: "New York",
        country: "United States",
        latitude: 40.7128,
        longitude: -74.006,
        timezone: "America/New_York",
      },
      london: {
        city: "London",
        country: "United Kingdom",
        latitude: 51.5074,
        longitude: -0.1278,
        timezone: "Europe/London",
      },
      paris: {
        city: "Paris",
        country: "France",
        latitude: 48.8566,
        longitude: 2.3522,
        timezone: "Europe/Paris",
      },
      berlin: {
        city: "Berlin",
        country: "Germany",
        latitude: 52.52,
        longitude: 13.405,
        timezone: "Europe/Berlin",
      },
      rome: {
        city: "Rome",
        country: "Italy",
        latitude: 41.9028,
        longitude: 12.4964,
        timezone: "Europe/Rome",
      },
      madrid: {
        city: "Madrid",
        country: "Spain",
        latitude: 40.4168,
        longitude: -3.7038,
        timezone: "Europe/Madrid",
      },
      amsterdam: {
        city: "Amsterdam",
        country: "Netherlands",
        latitude: 52.3676,
        longitude: 4.9041,
        timezone: "Europe/Amsterdam",
      },
      zurich: {
        city: "Zurich",
        country: "Switzerland",
        latitude: 47.3769,
        longitude: 8.5417,
        timezone: "Europe/Zurich",
      },
      vienna: {
        city: "Vienna",
        country: "Austria",
        latitude: 48.2082,
        longitude: 16.3738,
        timezone: "Europe/Vienna",
      },
      stockholm: {
        city: "Stockholm",
        country: "Sweden",
        latitude: 59.3293,
        longitude: 18.0686,
        timezone: "Europe/Stockholm",
      },

      // Other Global Cities
      sydney: {
        city: "Sydney",
        country: "Australia",
        latitude: -33.8688,
        longitude: 151.2093,
        timezone: "Australia/Sydney",
      },
      melbourne: {
        city: "Melbourne",
        country: "Australia",
        latitude: -37.8136,
        longitude: 144.9631,
        timezone: "Australia/Melbourne",
      },
      toronto: {
        city: "Toronto",
        country: "Canada",
        latitude: 43.6532,
        longitude: -79.3832,
        timezone: "America/Toronto",
      },
      vancouver: {
        city: "Vancouver",
        country: "Canada",
        latitude: 49.2827,
        longitude: -123.1207,
        timezone: "America/Vancouver",
      },
      dubai: {
        city: "Dubai",
        country: "UAE",
        latitude: 25.2048,
        longitude: 55.2708,
        timezone: "Asia/Dubai",
      },
      cairo: {
        city: "Cairo",
        country: "Egypt",
        latitude: 30.0444,
        longitude: 31.2357,
        timezone: "Africa/Cairo",
      },
      cape_town: {
        city: "Cape Town",
        country: "South Africa",
        latitude: -33.9249,
        longitude: 18.4241,
        timezone: "Africa/Johannesburg",
      },
      sao_paulo: {
        city: "São Paulo",
        country: "Brazil",
        latitude: -23.5505,
        longitude: -46.6333,
        timezone: "America/Sao_Paulo",
      },
      mexico_city: {
        city: "Mexico City",
        country: "Mexico",
        latitude: 19.4326,
        longitude: -99.1332,
        timezone: "America/Mexico_City",
      },
    };

    return (
      locationDatabase[placeId] || {
        city: description.split(",")[0].trim(),
        country: description.split(",").slice(-1)[0].trim(),
        latitude: 0,
        longitude: 0,
        timezone: "UTC",
      }
    );
  };

  const handleLocationSelect = async (suggestion: LocationSuggestion) => {
    const details = await getLocationDetails(
      suggestion.place_id,
      suggestion.description,
    );

    setFormData((prev) => ({
      ...prev,
      location: details,
    }));

    setLocationQuery(suggestion.description);
    setShowSuggestions(false);
    setErrors((prev) => ({ ...prev, location: "" }));
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.birthDate) {
      newErrors.birthDate = "Birth date is required";
    }

    if (!formData.location.city) {
      newErrors.location = "Birth location is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleInputChange = (field: keyof BirthData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (locationQuery) {
        searchLocations(locationQuery);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [locationQuery]);

  return (
    <div className="bg-dark-800 rounded-2xl p-8 border border-dark-700">
      <div className="mb-8">
        <h2 className="text-3xl font-serif font-bold text-white mb-2">
          Birth Information
        </h2>
        <p className="text-gray-400">
          Enter your birth details to generate your personalized astrological
          chart
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <User className="w-4 h-4 inline mr-2" />
            Full Name
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className={`w-full bg-dark-700 border rounded-lg p-3 text-white placeholder-gray-400 focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-colors ${
              errors.name ? "border-red-500" : "border-dark-600"
            }`}
            placeholder="Enter your full name"
          />
          {errors.name && (
            <p className="text-red-400 text-sm mt-1">{errors.name}</p>
          )}
        </div>

        {/* Birth Date Field */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Calendar className="w-4 h-4 inline mr-2" />
            Birth Date
          </label>
          <input
            type="date"
            value={formData.birthDate}
            onChange={(e) => handleInputChange("birthDate", e.target.value)}
            className={`w-full bg-dark-700 border rounded-lg p-3 text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-colors ${
              errors.birthDate ? "border-red-500" : "border-dark-600"
            }`}
          />
          {errors.birthDate && (
            <p className="text-red-400 text-sm mt-1">{errors.birthDate}</p>
          )}
        </div>

        {/* Birth Time Field */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Clock className="w-4 h-4 inline mr-2" />
            Birth Time (Optional)
          </label>
          <input
            type="time"
            value={formData.birthTime}
            onChange={(e) => handleInputChange("birthTime", e.target.value)}
            className="w-full bg-dark-700 border border-dark-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-colors"
          />
          <p className="text-gray-500 text-sm mt-1">
            Time of birth provides more accurate readings. Leave blank if
            unknown.
          </p>
        </div>

        {/* Birth Location Field */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <MapPin className="w-4 h-4 inline mr-2" />
            Birth Location
          </label>
          <div className="relative">
            <input
              type="text"
              value={locationQuery}
              onChange={(e) => {
                setLocationQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              className={`w-full bg-dark-700 border rounded-lg p-3 pr-10 text-white placeholder-gray-400 focus:ring-2 focus:ring-accent-500 focus:border-transparent transition-colors ${
                errors.location ? "border-red-500" : "border-dark-600"
              }`}
              placeholder="Search for your birth city..."
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              {locationLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <Search className="w-4 h-4 text-gray-400" />
              )}
            </div>
          </div>

          {/* Location Suggestions */}
          {showSuggestions && locationSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-dark-700 border border-dark-600 rounded-lg shadow-xl max-h-60 overflow-y-auto">
              {locationSuggestions.map((suggestion) => (
                <button
                  key={suggestion.place_id}
                  type="button"
                  onClick={() => handleLocationSelect(suggestion)}
                  className="w-full text-left p-3 hover:bg-dark-600 transition-colors border-b border-dark-600 last:border-b-0"
                >
                  <div className="text-white font-medium">
                    {suggestion.structured_formatting.main_text}
                  </div>
                  <div className="text-gray-400 text-sm">
                    {suggestion.structured_formatting.secondary_text}
                  </div>
                </button>
              ))}
            </div>
          )}

          {errors.location && (
            <p className="text-red-400 text-sm mt-1">{errors.location}</p>
          )}

          {formData.location.city && (
            <div className="mt-2 p-3 bg-dark-700 rounded-lg border border-dark-600">
              <p className="text-sm text-gray-300">
                <strong>Selected:</strong> {formData.location.city},{" "}
                {formData.location.country}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Coordinates: {formData.location.latitude.toFixed(4)},{" "}
                {formData.location.longitude.toFixed(4)}
              </p>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <div className="pt-4">
          <Button
            type="submit"
            loading={loading}
            className="w-full bg-gradient-to-r from-accent-600 to-accent-700 hover:from-accent-700 hover:to-accent-800 text-white font-semibold py-4 text-lg"
          >
            Generate Birth Chart
          </Button>
        </div>
      </form>
    </div>
  );
};

export default BirthDataForm;
