'use client'

import ReleaseLinks from '../../../components/ReleaseLinks'
import Header from '../../../components/Header'
import { useEffect, useState } from 'react'
import * as XLSX from 'xlsx'
import { useParams } from 'next/navigation'

function normalizeSlug(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\+/g, 'plus')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
}

function getKey(r) {
  return `${r.artists.join('-')}-${r.title}`
}

function getReleaseKey(r) {
  return [r.artists.join(','), r.title, r.year].join('|').toLowerCase()
}

function parseRelease(text) {
  if (!text) return {}

  text = text.replace(/\[\[/g, '[')
  const match = text.match(/\[(.*?)\]/)

  let label = ''
  let catalog = ''

  if (match) {
    const inside = match[1].replace(/\/+/g, '/').trim()
    if (inside.includes('/')) {
      const parts = inside.split('/')
      label = parts[0]?.trim() || ''
      catalog = parts[1]?.trim
