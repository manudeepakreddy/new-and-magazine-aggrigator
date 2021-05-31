import sys
import numpy as np
import pandas as pd
from typing import List
from typing import Dict
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
# songs = pd.read_csv('./data.csv')
# # print(songs.head())
# # songs = songs.sample(n=20).drop('author', axis=1).reset_index(drop=True)
# songs['description'] = songs['description'].str.replace('\n', '')
# tfidf = TfidfVectorizer(analyzer='word', stop_words='english')
# lyrics_matrix = tfidf.fit_transform(songs['description'])
# cosine_similarities = cosine_similarity(lyrics_matrix)
# similarities = {}
# for i in range(len(cosine_similarities)):
#     similar_indices = cosine_similarities[i].argsort()[:-50:-1] 
#     similarities[songs['newtitle'].iloc[i]] = [(cosine_similarities[i][x], songs['newtitle'][x], songs['type_of_news'][x]) for x in similar_indices][1:]
# for i in similarities:
#     print(i,"-----",similarities[i])
# class ContentBasedRecommender:
#     def __init__(self, matrix):
#         self.matrix_similar = matrix

#     def _print_message(self, song, recom_song):
#         rec_items = len(recom_song)
        
#         print(f'The {rec_items} recommended songs for {song} are:')
#         for i in range(rec_items):
#             # print(f"Number {i+1}:")
#             print(f"{recom_song[i][1]} by {recom_song[i][2]} with {round(recom_song[i][0], 3)} similarity score") 
#             # print("--------------------")
        
#     def recommend(self, recommendation):
#         # Get song to find recommendations for
        
#         song = recommendation['song']
#         # Get number of songs to recommend
#         number_songs = recommendation['number_songs']
#         # Get the number of songs most similars from matrix similarities
#         # for i in song:
#         #     print(i)
#         #     break
#         recom_song = self.matrix_similar[song][:number_songs]
#         # recom_song = song
#         # print each item
#         self._print_message(song=song, recom_song=recom_song)
# recommedations = ContentBasedRecommender(similarities)
# recommendation = {
#     "song": songs['newtitle'].iloc[1],
#     "number_songs": 10
# }
# recommedations.recommend(recommendation)

def load_csv(file_path):
    csv_data = pd.read_csv(file_path)
    string_data = csv_data['description']
    indices = csv_data["_id"]
    return string_data, indices

def convert_w2v(data, string):
    tf_id = TfidfVectorizer()
    tf_id_fit = tf_id.fit(data)
    vect = tf_id_fit.transform(data)
    query_string = tf_id_fit.transform(string)
    return vect, query_string

def similarity(data, string, top):
    sim = cosine_similarity(string, data)
    sort_sim = np.argsort(sim)[::-1]
    sort_sim = np.squeeze(sort_sim).tolist()
    top_sim = sort_sim[:top]

    return top_sim


def main(csv_data_path, query, top_result):
    """
    
    Parameters
    ----------
    csv_data_path : string
    query: string
    top_result: int

    Returns
    -------
    top_result_indices: list
    """
    index_list = []
    data, index = load_csv(csv_data_path)
    # import pdb;pdb.set_trace()
    data_vec, query_vec = convert_w2v(data, [query])
    top_result_indices = similarity(data_vec, query_vec, top_result)
    # print(f'qury string:: {query}')
    for res in top_result_indices:
        # print(f'similarity:: {data[res]}')
        index_list.append(index[res])
    return index_list


