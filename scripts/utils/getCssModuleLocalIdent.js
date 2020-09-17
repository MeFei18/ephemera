import loaderUtils from 'loader-utils';
import path from 'path';

export function getLocalIdent(context, localIdentName, localName, options) {
    const fileNameOrFolder = context.resourcePath.match(/index\.module\.(css|scss|sass)$/)
        ? '[folder]'
        : '[name]';
    const hash = loaderUtils.getHashDigest(
        path.posix.relative(context.rootContext, context.resourcePath) + localName,
        'md5',
        'base64',
        5,
    );
    const className = loaderUtils.interpolateName(
        context,
        fileNameOrFolder + '_' + localName + '__' + hash,
        options,
    );
    return className.replace('.module_', '_');
}
