/**
 * Handles saving stories
 */

import { ApplicationState } from './Store'

export async function save(slug: String, content: ApplicationState) {
  let request = await fetch(`/api/${slug}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      adventure: { content }
    })
  })

  if (request.ok === false) {
    throw request
  }

  return request.json()
}
