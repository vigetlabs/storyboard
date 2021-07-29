if Adventure.count == 0
  puts "Seeding Public Adventure"
  Adventure.create(
    title: "Pointless Adventure",
    description: "It's the pointless one!",
    has_password: false
  )

  puts "Seeding Private Adventure"
  Adventure.create(
    title: "Private Adventure",
    description: "It's the private one! Good luck finding it!",
    has_password: true,
    password: "password"
  )

  [
    "eli",
    "nate",
    "joe",
    "julia",
    "albert",
    "angela",
    "ola"
  ].each do |name|
    puts "Seeding user: #{name}@test.com"
    user = User.create(email: "#{name}@test.com", password: "password")

    puts "  - Public Adventure"
    Adventure.create(
      user: user,
      title: "#{name.capitalize}'s Adventure",
      has_password: false
    )

    puts "  - Private Adventure"
    Adventure.create(
      user: user,
      title: "#{name.capitalize}'s _Secret_ Adventure",
      has_password: true,
      password: "password"
    )
  end
end
