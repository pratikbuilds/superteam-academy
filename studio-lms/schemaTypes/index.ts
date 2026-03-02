import {courseType} from './course'
import {creatorType} from './creator'
import {contentLessonType, challengeLessonType} from './lesson'
import {moduleType} from './module'
import {testCaseType} from './testCase'

export const schemaTypes = [
  testCaseType,
  contentLessonType,
  challengeLessonType,
  moduleType,
  creatorType,
  courseType,
]
