# This migration comes from pointless_feedback (originally 20130501182659)
class CreatePointlessFeedbackMessages < ActiveRecord::Migration[5.2]
  def change
    create_table :pointless_feedback_messages do |t|
      t.string :name
      t.string :email_address
      t.string :topic
      t.text :description

      t.timestamps
    end
  end
end
