require 'json'

package = JSON.parse(File.read("package.json"))

Pod::Spec.new do |s|
  s.name         = "pushly-push-sdk-react-native"
  s.version      = package["version"]
  s.summary      = package["description"]

  s.authors      = package["author"]
  s.homepage     = 'https://github.com/pushly/push-sdk-react-native'
  s.license      = package["license"]

  s.platforms    = { :ios => "11.0" }
  s.source       = { :git => "#{package["repository"]["url"]}", :tag => s.version.to_s }

  s.source_files = 'ios/**/*.{h,m,mm,swift}'

  s.dependency "React-Core"
  s.dependency "Pushly", '>= 1.0.0', '< 2.0.0'
end
