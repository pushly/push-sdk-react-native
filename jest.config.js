module.exports = {
    preset: "react-native",
    moduleDirectories: ["node_modules","src"],
    modulePathIgnorePatterns: ["example", "lib"],
    collectCoverage: true,
    collectCoverageFrom: ["src/**/*"],
    moduleFileExtensions: [
        "ts",
        "tsx",
        "js",
        "jsx",
        "json",
        "node"
    ]
}
