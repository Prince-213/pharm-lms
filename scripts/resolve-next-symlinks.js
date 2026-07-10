/**
 * Next.js 16 Turbopack Symlink Resolver for AWS Amplify
 *
 * Next.js 16+ Turbopack creates hashed symlinks for externalized packages
 * (e.g. pino-3de069a0e16ae0ec -> ../../node_modules/pino).
 *
 * AWS Amplify's compute bundler cannot handle these symlinks and fails with
 * "EEXIST: file already exists". This script replaces symlinks with real
 * directory copies (including scoped packages like @prisma/client).
 *
 * See: https://github.com/aws-amplify/amplify-hosting/issues/4074
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const nextModules = path.join(__dirname, "..", ".next", "node_modules");
const rootModules = path.join(__dirname, "..", "node_modules");

function resolveDependencyPath(depName, parentPkgPath) {
  const directPath = path.join(rootModules, depName);
  try {
    const stat = fs.lstatSync(directPath);
    if (stat.isSymbolicLink()) {
      return fs.realpathSync(directPath);
    }
    if (stat.isDirectory()) {
      return directPath;
    }
  } catch {
    // Not found at root level
  }

  if (parentPkgPath) {
    const parentNodeModules = path.dirname(parentPkgPath);
    const pnpmDepPath = path.join(parentNodeModules, depName);
    try {
      const stat = fs.lstatSync(pnpmDepPath);
      if (stat.isSymbolicLink()) {
        return fs.realpathSync(pnpmDepPath);
      }
      if (stat.isDirectory()) {
        return pnpmDepPath;
      }
    } catch {
      // Not found in parent's node_modules
    }
  }

  return null;
}

function copyPackageWithDeps(pkgPath, destPath, copiedSet, originalPkgPath) {
  const pkgName = path.relative(nextModules, destPath);

  if (copiedSet.has(pkgName)) {
    return 0;
  }

  copiedSet.add(pkgName);

  console.log(`  Copying: ${pkgName}`);
  fs.cpSync(pkgPath, destPath, { recursive: true, dereference: true });
  let count = 1;

  const pkgJsonPath = path.join(destPath, "package.json");
  if (fs.existsSync(pkgJsonPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
    const deps = Object.keys(pkg.dependencies || {});

    for (const dep of deps) {
      const depDest = path.join(nextModules, dep);

      if (!fs.existsSync(depDest) && !copiedSet.has(dep)) {
        const depSrc = resolveDependencyPath(dep, originalPkgPath || pkgPath);
        if (depSrc) {
          count += copyPackageWithDeps(depSrc, depDest, copiedSet, depSrc);
        } else {
          console.log(`  Warning: Could not find dependency ${dep}`);
        }
      }
    }
  }

  return count;
}

function resolveSymlink(linkPath, label, copiedSet) {
  const target = fs.realpathSync(linkPath);
  console.log(`Resolving: ${label} -> ${target}`);
  fs.rmSync(linkPath);
  copyPackageWithDeps(target, linkPath, copiedSet, target);
}

function main() {
  if (!fs.existsSync(nextModules)) {
    console.log("No .next/node_modules directory found, skipping.");
    return;
  }

  const entries = fs.readdirSync(nextModules);
  let resolved = 0;
  const copiedSet = new Set();

  for (const name of entries) {
    const linkPath = path.join(nextModules, name);
    const stat = fs.lstatSync(linkPath);

    if (stat.isSymbolicLink()) {
      resolveSymlink(linkPath, name, copiedSet);
      resolved++;
    } else if (stat.isDirectory() && name.startsWith("@")) {
      const scopeEntries = fs.readdirSync(linkPath);
      for (const scopeName of scopeEntries) {
        const scopeLinkPath = path.join(linkPath, scopeName);
        const scopeStat = fs.lstatSync(scopeLinkPath);

        if (scopeStat.isSymbolicLink()) {
          resolveSymlink(scopeLinkPath, `${name}/${scopeName}`, copiedSet);
          resolved++;
        }
      }
    }
  }

  console.log(
    `\nResolved ${resolved} symlinks, copied ${copiedSet.size} packages total.`,
  );
}

main();
