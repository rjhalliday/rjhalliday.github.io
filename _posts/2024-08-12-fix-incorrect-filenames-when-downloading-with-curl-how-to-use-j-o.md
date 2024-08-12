---
layout: default
title: "Fix Incorrect Filenames When Downloading with curl: How to Use -J -O"
date: 2024-08-12 00:00:00 +1000
categories: [linux]
tags: [web, bash, curl]
---

## Understanding `curl` for File Downloads: Ensuring Correct Filenames with `-J -O`

When it comes to downloading files from the command line, `curl` is a versatile and powerful tool. However, a common issue arises when the filename of the downloaded file isn't what you expect. This can happen due to how the server sends the file or how `curl` handles the download process by default. Thankfully, `curl` offers a solution with the `-J` and `-O` options, which allow you to control the naming of the downloaded file based on the content disposition header.

### The Problem: Unexpected Filenames

Let's say you're downloading a file from a URL. Typically, you'd expect the file to be saved with the same name it has on the server. However, in many cases, you might find that the filename is not as expected—it could be missing an extension, have an incorrect name, or be something generic like `download`. 

This happens because `curl`, by default, does not pay attention to the `Content-Disposition` header sent by the server. This header usually contains the correct filename that the server intends for the file, but unless instructed, `curl` won’t use this information.

### Checking the `Content-Disposition` Header

Before using the `-J -O` options, it’s a good idea to first check if the server is sending a `Content-Disposition` header with the filename. This can be done easily with `curl` by fetching the headers using the `-I` or `-D` options.

#### Viewing the Headers with `-I`

The `-I` option makes a HEAD request, retrieving the headers without downloading the file. Here's how to use it:

```sh
curl -I https://example.com/download/file
```

This command will display all the headers sent by the server, including the `Content-Disposition` header if it’s present.

#### Saving the Headers with `-D`

Alternatively, you can save the headers to a file using the `-D` option:

```sh
curl -D headers.txt https://example.com/download/file
```

This command saves the headers to a file named `headers.txt`, which you can open to check if the `Content-Disposition` header is present and what filename it specifies.

Look for a line in the headers that looks like this:

```plaintext
Content-Disposition: attachment; filename="example.pdf"
```

This tells you that the server suggests saving the file as `example.pdf`.

### The Solution: Using `-J` and `-O`

Once you’ve confirmed that the `Content-Disposition` header is present and includes the correct filename, you can proceed to use the `-J` and `-O` options together to download the file with the intended name.

- **`-O`**: This option tells `curl` to save the file using the remote file's name as given in the URL. However, this alone doesn't take the `Content-Disposition` header into account.
  
- **`-J`**: This option, when used with `-O`, tells `curl` to check the `Content-Disposition` header and use the filename specified there. If this header is not present, `curl` will revert to using the filename from the URL.

### Example Usage

After confirming the filename with the `Content-Disposition` header, you can download the file as follows:

```sh
curl -O -J https://example.com/download/file
```

This command ensures that `curl` uses the filename provided in the `Content-Disposition` header, saving the file with the correct name.

### When Should You Use `-J -O`?

The `-J -O` options are particularly useful when:

- The server uses a generic URL path that doesn’t reflect the actual filename.
- The filename contains additional information such as version numbers or timestamps that are only included in the `Content-Disposition` header.
- You want to avoid manually renaming files after download.

### A Note on Security

While using `-J`, be cautious about potential security risks. The `Content-Disposition` header is controlled by the server, so always ensure you are downloading from a trusted source to avoid filename exploits.

### Conclusion

Using `curl` to download files is straightforward, but getting the correct filename can sometimes be tricky. By first checking the `Content-Disposition` header and then leveraging the `-J -O` options, you can ensure that your downloads are saved with the intended filenames as specified by the server, saving you time and hassle. Whether you're automating downloads in scripts or simply fetching a file from the web, these options help streamline the process and avoid common pitfalls.
