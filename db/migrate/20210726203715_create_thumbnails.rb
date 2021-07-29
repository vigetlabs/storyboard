class CreateThumbnails < ActiveRecord::Migration[5.2]
  def change
    create_table :thumbnails do |t|
      t.string :signature, null: false
      t.string :uid, null: false

      t.timestamps
    end

    add_index :thumbnails, :signature, unique: true
    add_index :thumbnails, :uid, unique: true
  end
end
