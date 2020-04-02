class AddEncryptedPasswordToAdventures < ActiveRecord::Migration[5.2]
  def change
    add_column :adventures, :password_digest, :string, null: false, default: ""
  end
end
