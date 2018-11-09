class AddUserIdToStories < ActiveRecord::Migration[5.2]
  def change
    add_column :stories, :user_id, :integer

    add_index :stories, :user_id
    add_foreign_key :stories, :users, on_delete: :cascade
  end
end
