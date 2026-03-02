import {defineField, defineType} from 'sanity'

export const courseType = defineType({
  name: 'course',
  title: 'Course',
  type: 'document',
  fields: [
    defineField({
      name: 'slug',
      type: 'slug',
      options: {source: 'title'},
      description: 'Must match on-chain course_id',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'title',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'description',
      type: 'text',
      rows: 4,
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'shortDescription',
      type: 'string',
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'thumbnail',
      type: 'image',
      options: {hotspot: true},
      description: 'Course thumbnail image',
    }),
    defineField({
      name: 'trackId',
      type: 'string',
      description: 'e.g. solana-fundamentals, anchor-development, defi-on-solana',
      options: {
        list: [
          {title: 'Solana Fundamentals', value: 'solana-fundamentals'},
          {title: 'Anchor Development', value: 'anchor-development'},
          {title: 'DeFi on Solana', value: 'defi-on-solana'},
        ],
      },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: 'difficulty',
      type: 'number',
      description: '1 = Beginner, 2 = Intermediate, 3 = Advanced',
      options: {
        list: [
          {title: 'Beginner', value: 1},
          {title: 'Intermediate', value: 2},
          {title: 'Advanced', value: 3},
        ],
      },
      validation: (rule) => rule.required().min(1).max(3),
    }),
    defineField({
      name: 'modules',
      type: 'array',
      of: [{type: 'module'}],
      validation: (rule) => rule.required().min(1),
    }),
    defineField({
      name: 'xpReward',
      type: 'number',
      description: 'Total XP for completing the course',
      validation: (rule) => rule.required().min(0),
    }),
    // creator can be added later: defineField({ name: 'creator', type: 'creator', ... }),
    defineField({
      name: 'prerequisiteSlug',
      type: 'string',
      description: 'Slug of required course (leave empty if none)',
    }),
    defineField({
      name: 'isActive',
      type: 'boolean',
      initialValue: true,
      description: 'Inactive courses are hidden from the catalog',
    }),
    defineField({
      name: 'tags',
      type: 'array',
      of: [{type: 'string'}],
      options: {
        layout: 'tags',
      },
    }),
  ],
  orderings: [
    {title: 'Title A–Z', name: 'titleAsc', by: [{field: 'title', direction: 'asc'}]},
    {title: 'Title Z–A', name: 'titleDesc', by: [{field: 'title', direction: 'desc'}]},
  ],
  preview: {
    select: {title: 'title', slug: 'slug.current'},
    prepare: ({title, slug}) => ({
      title: title || 'Untitled Course',
      subtitle: slug ? `/courses/${slug}` : undefined,
    }),
  },
})
