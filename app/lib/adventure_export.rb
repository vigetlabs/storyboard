require 'csv'

class AdventureExport
  def self.export
    CSV.generate(headers: true) do |csv|
      csv << [
        "ID",
        "Title",
        "URL",
        "Size",
        "Description",
        "Theme",
        "Featured",
        "Public",
        "User",
        "Created",
        "Updated"
      ]

      Adventure.all.each do |adv|
        csv << [
          adv.id,
          adv.title,
          "https://storyboard.viget.com/#{adv.slug}",
          adv.content.to_s.length,
          adv.description,
          adv.theme,
          adv.featured ? "True" : "False",
          adv.public ? "True" : "False",
          adv.user.try(:email),
          adv.created_at.strftime("%x"),
          adv.updated_at.strftime("%x")
        ]
      end
    end
  end
end
