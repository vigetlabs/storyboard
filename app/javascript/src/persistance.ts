/**
 * Handles saving stories
 */

import { ApplicationState } from './Store'
import { set } from 'lodash'

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

export async function savePhoto(metaId: String, image: String, state: ApplicationState, updateState: (state: Readonly<ApplicationState>) => Readonly<ApplicationState>) {
  let request = await fetch(`/api/photos/${metaId}`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      image: image
    })
  })

  if (request.ok === false) {
    throw request
  }

  const data = await request.json()
  updateState(set(state, `meta.${metaId}.image`, data.url))

  return request.json()
}

export async function removePhoto(metaId: String) {
  let request = await fetch(`/api/photos/${metaId}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json'
    }
  })

  if (request.ok === false) {
    throw request
  }

  return request.json()
}
