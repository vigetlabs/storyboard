require "rails_helper"

RSpec.describe SurveyMailer do
  describe "#initial_feedback" do
    it "sends the survey to the user" do
      user = create(:user, email: "survey@example.com")
      mail = described_class.initial_feedback(user)

      expect(mail.to).to eq(["survey@example.com"])
      expect(mail.from).to eq(["no-reply@storyboard.viget.com"])
      expect(mail.subject).to eq("Storyboard User Survey")
      expect(mail.body.encoded).to include("Unsubscribe")
    end
  end
end
