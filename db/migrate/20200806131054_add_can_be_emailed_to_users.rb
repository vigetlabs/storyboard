class AddCanBeEmailedToUsers < ActiveRecord::Migration[5.2]
  def change
    add_column :users, :can_be_emailed, :boolean, default: true
  end
end
