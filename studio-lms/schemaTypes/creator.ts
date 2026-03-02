import {defineField, defineType} from 'sanity'

export const creatorType = defineType({
  name: 'creator',
  title: 'Creator',
  type: 'object',
  fields: [
    defineField({
      name: 'name',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'avatar',
      type: 'image',
      options: {hotspot: true},
    }),
    defineField({
      name: 'title',
      type: 'string',
      description: 'Creator role/title',
      validation: (rule) => rule.required(),
    }),
  ],
})
