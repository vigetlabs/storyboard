class CreateStories < ActiveRecord::Migration[5.2]
  def change
    create_table :adventures do |t|
      t.string :title, null: false
      t.string :slug,  null: false
      t.text :description

      t.timestamps
    end
  end
end
