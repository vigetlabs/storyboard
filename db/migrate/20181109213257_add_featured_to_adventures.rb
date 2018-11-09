class AddFeaturedToAdventures < ActiveRecord::Migration[5.2]
  def change
    add_column :adventures, :featured, :boolean, default: true
  end
end
