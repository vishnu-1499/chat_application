const env = "local"; 

const config = {
    local: {
        Backend_Url: "http://localhost:8080",
    },
};

export default config[env];
