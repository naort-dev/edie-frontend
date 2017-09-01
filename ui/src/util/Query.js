import QueryParser from 'lucene'
import {assign} from 'lodash'

const implicit = '<implicit>'

export function findField (parsed, field) {
  if (parsed.field) {
    return parsed.field === field ? { field: parsed, parent: [] } : null
  }

  if (parsed.left) {
    const res = findField(parsed.left, field)
    if (res) {
      res.parent.push({
        field: parsed,
        type: 'left'
      })
      return res
    }
  }

  if (parsed.right) {
    const res = findField(parsed.right, field)
    if (res && !res.parent) {
      res.parent.push({
        field: parsed,
        type: 'right'
      })
      return res
    }
  }

  return null
}

function prefixCharWithBackslashes(char) {
  return '\\' + char;
}

function escapeQuotedTerm(s) {
  return s.replace(/"/g, prefixCharWithBackslashes);
}

export function queryToString(ast) {
  if (!ast) {
    return '';
  }

  var result = '';

  if (ast.start != null) {
    result += ast.start + ' ';
  }

  if (ast.field && ast.field !== implicit) {
    result += ast.field + ':';
  }

  if (ast.left) {
    if (ast.parenthesized) {
      result += '(';
    }
    result += queryToString(ast.left);
  }

  if (ast.operator) {
    if (ast.left) {
      result += ' ';
    }

    if (ast.operator !== implicit) {
      result += ast.operator;
    }
  }

  if (ast.right) {
    if (ast.operator && ast.operator !== implicit) {
      result += ' ';
    }
    result += queryToString(ast.right);
  }

  if (ast.parenthesized && ast.left) {
    result += ')';
  }

  if (ast.term) {
    if (ast.prefix) {
      result += ast.prefix;
    }
    if (ast.quoted) {
      result += '"';
      result += escapeQuotedTerm(ast.term);
      result += '"';
    } else {
      result += ast.term;
    }

    if (ast.proximity != null) {
      result += '~' + ast.proximity;
    }

    if (ast.boost != null) {
      result += '^' + ast.boost;
    }
  }

  if (ast.term_min) {
    if (ast.inclusive) {
      result += '[';
    } else {
      result += '{';
    }

    result += ast.term_min;
    result += ' TO ';
    result += ast.term_max;

    if (ast.inclusive) {
      result += ']';
    } else {
      result += '}';
    }
  }

  if (ast.similarity) {
    result += '~';

    if (ast.similarity !== 0.5) {
      result += ast.similarity;
    }
  }

  return result;
}


function clearObject(object) {
  for (const member in object) delete object[member]
}

export function modifyArrayValues (query, field, values, operator = 'AND') {
  let parsed
  try {
    parsed = QueryParser.parse(query)
    if (!parsed) return null
  } catch (e) {
    return null
  }

  let newQuery = query
  const found = findField(parsed, field)
  const el = `(${field}:${values.join(` ${operator} `)})`
  if (found) {

    clearObject(found.parent[0])
    assign(found.parent[0], QueryParser.parse(el).left)

    let parentIndex = 1
    while (parentIndex < found.parent.length) {
      if (found.parent[parentIndex].right) break
      assign(found.parent[parentIndex], found.parent[0])
      parentIndex++
    }

    newQuery = queryToString(parsed)
  } else {
    if (!values.length) return
    if (newQuery) newQuery = `${newQuery} AND `
    newQuery = `${newQuery}${el}`
  }
}
