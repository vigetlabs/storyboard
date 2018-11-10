/**
 * Handles saving stories
 */

import { ApplicationState } from './Store'

export async function save(slug: String, content: Object) {
  let request = await fetch(`/api/${slug}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      adventure: { content }
    })
  })

  return request.json()
}
