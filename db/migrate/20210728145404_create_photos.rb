class CreatePhotos < ActiveRecord::Migration[5.2]
  def change
    create_table :photos do |t|
      t.string :meta_id
      t.string :image_name
      t.string :image_uid
    end

    add_index :photos, :meta_id, unique: true
  end
end
