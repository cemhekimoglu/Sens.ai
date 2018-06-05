require('dotenv').config()
const pd = require('paralleldots');
const Promise = require('bluebird')

pd.apiKey = process.env.PD_API_KEY

const intentAnalyzer = function(post) { // analyzes all posts
  if (post.content) {

    return new Promise(function(resolve, reject) {
      pd.intent(post.content)
      .then((response) => {
        let res = JSON.parse(response)
        post.analysis = res
        return resolve(post)
      })
      .catch( (e) => { return reject(e) } )
    })

  }

}

async function intentFilter(posts) { // filters posts based on intent

  let intentAnalyzedPosts = posts.map( post => {
    if (intentAnalyzer(post)) {
      return intentAnalyzer(post)
    }
  })

  intentAnalyzedPosts = await Promise.all(intentAnalyzedPosts)

  const intentFilter = function(post) {

    if (post) {
      let intent = post.analysis.intent
      let probabilityOf = post.analysis.probabilities

      if (intent == 'feedback/opinion' && probabilityOf["feedback/opinion"] >= 0.5) {
        return post
      }
    }

  }

  let filteredPosts = await Promise.filter(intentAnalyzedPosts, intentFilter)
  return filteredPosts
}

module.exports = intentFilter