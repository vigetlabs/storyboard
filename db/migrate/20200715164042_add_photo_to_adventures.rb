class AddPhotoToAdventures < ActiveRecord::Migration[5.2]
  def change
    add_column :adventures, :photo_uid, :string
    add_column :adventures, :photo_name, :string
  end
end
