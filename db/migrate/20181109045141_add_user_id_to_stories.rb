class AddUserIdToStories < ActiveRecord::Migration[5.2]
  def change
    add_column :adventures, :user_id, :integer

    add_index :adventures, :user_id
    add_foreign_key :adventures, :users, on_delete: :cascade
  end
end
