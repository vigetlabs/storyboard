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

export async function load(slug: String) {
  let response = await fetch(`/api/${slug}`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    }
  })

  if (response.ok === false) {
    throw new Error('Unable to load editor data.')
  }

  let { content } = await response.json()

  return content
}
