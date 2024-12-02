from google.cloud import language_v2
import google.generativeai as genai

# API key setup
genai.configure(api_key='AIzaSyCxBhgFRFTLM07hfse4I6cDQLbUOmaVXrk')
# set gemini model
model = genai.GenerativeModel("gemini-1.5-flash")

def use_AI(user_input, server_response):
    ''' 
        This function takes the user input and passes it to gemini using a
        specially engineered prmopt and returns something in natural language 

        returns: The result from gemini
    '''
    response = model.generate_content("Our user said: \"" + user_input + "\" \
and Our database responded with this: \"" + server_response + "\" using what \
the server said, generate a response to our user that gives them a clear \
understanding and a thorough response to their initial question. If the server \
did not provide a reply or gave an invalid reuest message, you may simply reply \
with an aplogetic message about not understanding what the user is asking and \
saying we can't answer that question. Keep your response limited to 200-300 words.")
    return response