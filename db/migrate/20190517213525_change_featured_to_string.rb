class ChangeFeaturedToString < ActiveRecord::Migration[5.2]
  FEATURED_SET = {
    "Fiction" => [
      "blood-is-thicker-than-water",
      "oakland",
      "san-francisco-2",
      "the-flamingo",
      "relic-delta",
      "a-killer-s-sparkles"
    ],
    "History" => [
      "perspectives-a-may-4th-1970-experience",
      "the-black-plague-2",
      "the-choices-we-make-an-interactive-history-experience",
      "cuban-missile-crisis-2",
      "immigrating-to-los-angeles",
      "working-through-the-republic",
    ],
    "Education and Training" => [
      "find-out-scholarships-available",
      "community-and-whatnot",
      "child-and-youth-homelessness",
      "virtual-resus",
      "troubleshooting-terminals",
      "the-procurement-journey",
    ]
  }

  def up
    remove_column :adventures, :featured
    add_column :adventures, :featured, :string

    FEATURED_SET.each do |group, slugs|
      slugs.each do |slug|
        execute <<~SQL
          UPDATE adventures
          SET featured = '#{group}'
          WHERE slug = '#{slug}'
        SQL
      end
    end
  end

  def down
    remove_column :adventures, :featured
    add_column :adventures, :featured, :boolean, default: false
  end
end
