import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const rootDir = process.cwd();

function readSource(...parts: string[]) {
  const filePath = join(rootDir, ...parts);
  expect(existsSync(filePath)).toBe(true);
  return readFileSync(filePath, "utf8");
}

describe("notes pages", () => {
  it("/notes renders notes as responsive cards with summaries and actions", () => {
    const source = readSource("src", "app", "(app)", "notes", "page.tsx");

    expect(source).toContain("学习笔记");
    expect(source).toContain("getNotes");
    expect(source).toContain("搜索标题或正文");
    expect(source).toContain("还没有笔记，记录第一条学习想法吧。");
    expect(source).toContain("grid gap-4 md:grid-cols-2 2xl:grid-cols-3");
    expect(source).toContain("data-note-card");
    expect(source).toContain("line-clamp-3");
    expect(source).toContain("attachment_count");
    expect(source).toContain("编辑");
    expect(source).toContain("删除");
  });

  it("note cards link to detail pages without showing full content or attachments", () => {
    const source = readSource("src", "app", "(app)", "notes", "page.tsx");

    expect(source).toContain("href={`/notes/${note.id}`}");
    expect(source).toContain("href={`/notes/${note.id}/edit`}");
    expect(source).not.toContain("whitespace-pre-wrap");
    expect(source).not.toContain("signed_url");
  });

  it("/notes/new renders the create form with uploads", () => {
    const source = readSource("src", "app", "(app)", "notes", "new", "page.tsx");

    expect(source).toContain("新建笔记");
    expect(source).toContain("createNoteAction");
    expect(source).toContain('name="title"');
    expect(source).toContain('name="content"');
    expect(source).toContain('name="attachments"');
    expect(source).toContain('type="file"');
  });

  it("/notes/[id] defaults to reading mode", () => {
    const source = readSource("src", "app", "(app)", "notes", "[id]", "page.tsx");

    expect(source).toContain("getNoteDetail");
    expect(source).toContain("阅读模式");
    expect(source).toContain("编辑笔记");
    expect(source).toContain("返回笔记列表");
    expect(source).toContain("whitespace-pre-wrap");
    expect(source).toContain("图片附件");
    expect(source).toContain("文件附件");
    expect(source).toContain("deleteNoteAction");
    expect(source).not.toContain("updateNoteAction");
    expect(source).not.toContain("<textarea");
    expect(source).not.toContain("dangerouslySetInnerHTML");
  });

  it("/notes/[id]/edit renders the editing form and attachment management", () => {
    const source = readSource("src", "app", "(app)", "notes", "[id]", "edit", "page.tsx");

    expect(source).toContain("编辑笔记");
    expect(source).toContain("updateNoteAction");
    expect(source).toContain("uploadNoteAttachmentAction");
    expect(source).toContain("deleteNoteAttachmentAction");
    expect(source).toContain('name="title"');
    expect(source).toContain("<textarea");
    expect(source).toContain("取消");
    expect(source).toContain("已有附件");
  });
});

describe("notes navigation and data safety", () => {
  it("adds the notes entry to the sidebar study tools", () => {
    const source = readSource("src", "components", "SidebarNavigation.tsx");

    expect(source).toContain('href: "/notes"');
    expect(source).toContain("学习笔记");
  });

  it("defines user-scoped note data functions", () => {
    const source = readSource("src", "lib", "study", "notes.ts");

    for (const functionName of [
      "getNotes",
      "getNoteDetail",
      "createNote",
      "updateNote",
      "deleteNote",
      "uploadNoteAttachment",
      "deleteNoteAttachment",
      "getNoteAttachmentSignedUrl",
    ]) {
      expect(source).toContain(`function ${functionName}`);
    }

    expect(source.match(/\.eq\("user_id", userId\)/g)?.length).toBeGreaterThanOrEqual(8);
    expect(source).not.toContain("service" + "_role");
  });
});
