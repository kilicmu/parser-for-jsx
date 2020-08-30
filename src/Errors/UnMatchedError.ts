export class UnMatchedError extends Error {

  constructor(msg: string) {
    super(msg);
  }

  static forTag(tag: string) {
    return new UnMatchedError(`unexpect tag : ${tag}`)
  }

  static forComments(code: string) {
    return new UnMatchedError(`unmatched comment: ${code}`)
  }

  static forAttrKey(code: string) {
    return new UnMatchedError('unexpect attr key, ${code} no key');
  }
}