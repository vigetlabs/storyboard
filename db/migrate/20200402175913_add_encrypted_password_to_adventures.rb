class AddEncryptedPasswordToAdventures < ActiveRecord::Migration[5.2]
  def change
    add_column :adventures, :password, :string, null: false, default: ""
    add_column :adventures, :has_password, :boolean, null: false, default: false
  end
end
