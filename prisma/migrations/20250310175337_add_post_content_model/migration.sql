-- CreateTable
CREATE TABLE "PostContent" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "postId" TEXT NOT NULL,
    "platformId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostContent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PostContent_postId_idx" ON "PostContent"("postId");

-- CreateIndex
CREATE INDEX "PostContent_platformId_idx" ON "PostContent"("platformId");

-- CreateIndex
CREATE UNIQUE INDEX "PostContent_postId_platformId_key" ON "PostContent"("postId", "platformId");

-- AddForeignKey
ALTER TABLE "PostContent" ADD CONSTRAINT "PostContent_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostContent" ADD CONSTRAINT "PostContent_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "SocialMediaPlatform"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
