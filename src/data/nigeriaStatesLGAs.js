// src/data/nigeriaStatesLGAs.js

// Basic data for Nigeria states and LGAs
const nigeriaStatesLGAs = {
    "Abia": [
      "Aba North", "Aba South", "Arochukwu", "Bende", "Ikwuano", 
      "Isiala Ngwa North", "Isiala Ngwa South", "Isuikwuato", "Obi Ngwa", 
      "Ohafia", "Osisioma", "Ugwunagbo", "Ukwa East", "Ukwa West", 
      "Umuahia North", "Umuahia South", "Umu Nneochi"
    ],
    "Akwa Ibom": [
      "Abak", "Eastern Obolo", "Eket", "Esit Eket", "Essien Udim",
      "Etim Ekpo", "Etinan", "Ibeno", "Ibesikpo Asutan", "Ibiono-Ibom",
      "Ika", "Ikono", "Ikot Abasi", "Ikot Ekpene", "Ini", "Itu",
      "Mbo", "Mkpat-Enin", "Nsit-Atai", "Nsit-Ibom", "Nsit-Ubium",
      "Obot Akara", "Okobo", "Onna", "Oron", "Oruk Anam",
      "Udung-Uko", "Ukanafun", "Uruan", "Urue-Offong/Oruko", "Uyo"
    ],
    "Lagos": [
      "Agege", "Ajeromi-Ifelodun", "Alimosho", "Amuwo-Odofin", "Apapa", 
      "Badagry", "Epe", "Eti Osa", "Ibeju-Lekki", "Ifako-Ijaiye", 
      "Ikeja", "Ikorodu", "Kosofe", "Lagos Island", "Lagos Mainland", 
      "Mushin", "Ojo", "Oshodi-Isolo", "Shomolu", "Surulere"
    ],
    "FCT": [
      "Abaji", "Bwari", "Gwagwalada", "Kuje", "Kwali", "Municipal Area Council"
    ]
    // Add more states and LGAs as needed
  };
  
  // Function to get all states
  const states = () => {
    return Object.keys(nigeriaStatesLGAs);
  };
  
  // Function to get LGAs for a state
  const lgas = (state) => {
    return nigeriaStatesLGAs[state] || [];
  };
  
  // Function to get state capital (simplified)
  const capital = (state) => {
    const capitals = {
      "Abia": "Umuahia",
      "Akwa Ibom": "Uyo",
      "Lagos": "Ikeja",
      "FCT": "Abuja"
    };
    return capitals[state] || null;
  };
  
  // Export the API
  const NaijaStates = {
    states,
    lgas,
    capital
  };
  
  export default NaijaStates;