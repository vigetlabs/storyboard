# This migration comes from pointless_feedback (originally 20220518205500)
class AddUrlToPointlessFeedbackMessages < ActiveRecord::Migration[5.2]
  def change
    add_column :pointless_feedback_messages, :url, :string
  end
end
